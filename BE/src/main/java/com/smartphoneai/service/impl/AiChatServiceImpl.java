package com.smartphoneai.service.impl;

import com.smartphoneai.service.AiChatService;
import com.smartphoneai.service.ChatResponder;
import com.smartphoneai.service.TopicRouter;
import com.smartphoneai.service.support.ChatTopics;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.dto.request.CreateConversationRequest;
import com.smartphoneai.dto.response.ChatMessageResponse;
import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.entity.*;
import com.smartphoneai.exception.*;
import com.smartphoneai.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.util.*;

@Service
public class AiChatServiceImpl implements AiChatService {
    private static final Set<String> TOPICS=Set.of("PHONE_CONSULTATION","SHOP_SUPPORT");
    private final AiGuestSessionRepository guests;
    private final AiConversationRepository conversations;
    private final AiMessageRepository messages;
    private final AiTopicSwitchRepository switches;
    private final TopicRouter router;
    private final ChatResponder responder;
    private final ObjectMapper mapper;
    private final Clock clock;
    private final OrderChatLookup orderLookup;
    private final AiChatReceiptRepository receipts;
    private final TransactionTemplate transaction;
    private record Actor(UUID userId) {}
    private record SendSnapshot(String topic, List<ChatMessageResponse> history, List<String> productIds, UUID token, Map<String,Object> replay) {}
    private record Prepared(TopicRouter.Decision decision, ChatResponder.Answer answer, boolean order) {}
    private record ConfirmSnapshot(UUID conversationId, UUID token, String topic, String question, Map<String,Object> replay) {}
    @Autowired
    public AiChatServiceImpl(AiGuestSessionRepository guests, AiConversationRepository conversations, AiMessageRepository messages,
                         AiTopicSwitchRepository switches, TopicRouter router, ChatResponder responder, ObjectMapper mapper, Clock clock,
                         OrderChatLookup orderLookup, AiChatReceiptRepository receipts, PlatformTransactionManager transactionManager) {
        this.guests=guests; this.conversations=conversations; this.messages=messages; this.switches=switches;
        this.router=router; this.responder=responder; this.mapper=mapper; this.clock=clock; this.orderLookup=orderLookup; this.receipts=receipts;
        this.transaction=new TransactionTemplate(transactionManager);
    }
    @Override
    @Transactional
    public UUID create(Authentication auth, String token, CreateConversationRequest request) {
        var actor=actor(auth);
        var conversation=new AiConversation(actor.userId(), null,
                ChatTopics.normalize(request.topic()), json(request.productIds()==null ? List.of() : request.productIds()), clock.instant());
        return conversations.save(conversation).getId();
    }
    @Override
    @Transactional
    public List<Map<String,Object>> list(Authentication auth, String token) {
        var actor=actor(auth);
        var found=conversations.findAllByUserIdOrderByCreatedAtDesc(actor.userId());
        return found.stream().map(this::conversationView).toList();
    }
    @Override
    @Transactional
    public Map<String,Object> detail(Authentication auth, String token, UUID id) {
        var actor=actor(auth); return conversationView(owned(actor,id));
    }
    @Override
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public void delete(Authentication auth, UUID id) {
        var actor=actor(auth);
        long deadline=System.nanoTime()+java.util.concurrent.TimeUnit.SECONDS.toNanos(30);
        for (;;) {
            boolean deleted=Boolean.TRUE.equals(transaction.execute(status -> {
                var conversation=owned(actor,id);
                if (conversation.processingAt(clock.instant())) return false;
                switches.deleteConversationReferences(id);
                messages.deleteConversationMessages(id);
                conversations.delete(conversation);
                return true;
            }));
            if (deleted) return;
            if (System.nanoTime()>=deadline) throw new ChatBusyException();
            try { Thread.sleep(100); }
            catch (InterruptedException ex) { Thread.currentThread().interrupt(); throw new ChatBusyException(); }
        }
    }
    @Override
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public Map<String,Object> send(Authentication auth, String token, UUID id, String rawContent) {
        return send(auth,token,id,rawContent,null);
    }
    @Override
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public Map<String,Object> send(Authentication auth, String token, UUID id, String rawContent, UUID requestId) {
        var actor=actor(auth);
        String content=rawContent.trim();
        var snapshot=transaction.execute(status -> {
            var conversation=owned(actor,id);
            if (requestId!=null) {
                var existing=receipts.findByConversationIdAndRequestId(id,requestId);
                if (existing.isPresent()) {
                    if (!existing.get().getContentHash().equals(hash(content))) throw new ChatRequestConflictException();
                    return new SendSnapshot(null,List.of(),List.of(),null,receiptView(existing.get().getResponseJson()));
                }
            }
            var pending=switches.findFirstByConversationIdAndStatus(id,"PENDING");
            if (pending.isPresent()) {
                if (pending.get().canConfirm(clock.instant())) throw new InvalidTopicSwitchException();
                pending.get().expire();
            }
            UUID lease=reserve(conversation);
            return new SendSnapshot(ChatTopics.normalize(conversation.getTopic()), messageViews(id), productIds(conversation.getProductIds()), lease,null);
        });
        if (snapshot.replay()!=null) return snapshot.replay();
        try {
            var prepared=prepare(actor,content,snapshot);
            return transaction.execute(status -> {
                var result=finishSend(actor,id,content,snapshot,prepared);
                if (requestId!=null) receipts.save(new AiChatReceipt(id,requestId,hash(content),json(result)));
                return result;
            });
        } finally { release(actor,id,snapshot.token()); }
    }
    private Prepared prepare(Actor actor, String content, SendSnapshot snapshot) {
        var history=snapshot.history();
        String currentTopic=snapshot.topic();
        if ("SHOP_SUPPORT".equals(currentTopic) && orderLookup.matches(content, history)) {
            var answer = new ChatResponder.Answer(orderLookup.answer(actor.userId(), content), List.of());
            return new Prepared(null,answer,true);
        }
        var decision=router.route(currentTopic,content,history);
        if (decision==null) throw new AiProviderException();
        if (!"SAME_TOPIC".equals(decision.result()) && !("DIFFERENT_TOPIC".equals(decision.result())
                && decision.suggestedTopic()!=null && currentTopic.equals(ChatTopics.normalize(decision.suggestedTopic()))))
            return new Prepared(decision,null,false);
        var answer=decision.needsCatalog() != null || decision.needsDocuments() != null
                ? responder.answer(currentTopic,content,history,snapshot.productIds(),decision)
                : responder.answer(currentTopic,content,history,snapshot.productIds());
        validateAnswer(answer);
        return new Prepared(decision,answer,false);
    }
    private Map<String,Object> finishSend(Actor actor, UUID id, String content, SendSnapshot snapshot, Prepared prepared) {
        var conversation=owned(actor,id);
        requireLease(conversation,snapshot.token());
        String currentTopic=snapshot.topic();
        if (prepared.order()) {
            addMessage(id,"user",content,List.of()); addAnswer(id,prepared.answer());
            conversation.endProcessing(snapshot.token());
            return answerView(id,null,prepared.answer());
        }
        var decision=prepared.decision();
        if ("OUT_OF_SCOPE".equals(decision.result())) {
            var answer = new ChatResponder.Answer("SHOP_SUPPORT".equals(currentTopic)
                    ? ChatTopics.SHOP_SCOPE_REMINDER : ChatTopics.PHONE_SCOPE_REMINDER, List.of());
            addMessage(id,"user",content,List.of());
            addAnswer(id,answer);
            conversation.endProcessing(snapshot.token());
            return answerView(id,null,answer);
        }
        String suggestedTopic = decision.suggestedTopic() == null ? null : ChatTopics.normalize(decision.suggestedTopic());
        if ("DIFFERENT_TOPIC".equals(decision.result()) && decision.suggestedTopic()!=null
                && TOPICS.contains(suggestedTopic) && !currentTopic.equals(suggestedTopic)) {
            addMessage(id,"user",content,List.of());
            var request=switches.save(new AiTopicSwitch(id,suggestedTopic,content,clock.instant()));
            conversation.endProcessing(snapshot.token());
            return switchView(request,currentTopic);
        }
        if (!"SAME_TOPIC".equals(decision.result()) && !("DIFFERENT_TOPIC".equals(decision.result()) && currentTopic.equals(suggestedTopic))) {
            addMessage(id,"user",content,List.of());
            String clarification="PHONE_CONSULTATION".equals(currentTopic)
                    ? "Mình chỉ hỗ trợ tư vấn về điện thoại. Bạn vui lòng nói rõ mẫu máy hoặc nhu cầu sử dụng nhé."
                    : "Bạn muốn hỏi về chủ đề nào? Vui lòng nói rõ thêm.";
            addMessage(id,"assistant",clarification,List.of());
            conversation.endProcessing(snapshot.token());
            return Map.of("type","CLARIFICATION_REQUIRED","message",clarification);
        }
        var answer=prepared.answer();
        validateAnswer(answer);
        addMessage(id,"user",content,List.of()); addAnswer(id,answer);
        conversation.endProcessing(snapshot.token());
        return answerView(id,null,answer);
    }
    @Override
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public Map<String,Object> confirm(Authentication auth, String token, UUID switchId) {
        var actor=actor(auth);
        var snapshot=transaction.execute(status -> {
            var conversationId=switches.findConversationId(switchId).orElseThrow(InvalidTopicSwitchException::new);
            var conversation=owned(actor,conversationId);
            var request=switches.findLocked(switchId).orElseThrow(InvalidTopicSwitchException::new);
            if ("CONFIRMED".equals(request.getStatus())) {
                var id=request.getNewConversationId();
                var message=messageViews(id).stream().filter(m -> "assistant".equals(m.role())).findFirst().orElseThrow(InvalidTopicSwitchException::new);
                return new ConfirmSnapshot(conversationId,null,null,null,
                        answerView(id,id,new ChatResponder.Answer(message.content(),message.sources(),message.recommendedProducts(),message.comparedProducts())));
            }
            if (!request.canConfirm(clock.instant())) throw new InvalidTopicSwitchException();
            return new ConfirmSnapshot(conversationId,reserve(conversation),request.getSuggestedTopic(),request.getQuestion(),null);
        });
        if (snapshot.replay()!=null) return snapshot.replay();
        try {
            var answer="SHOP_SUPPORT".equals(ChatTopics.normalize(snapshot.topic())) && orderLookup.matches(snapshot.question(), List.of())
                    ? new ChatResponder.Answer(orderLookup.answer(actor.userId(), snapshot.question()), List.of())
                    : responder.answer(snapshot.topic(),snapshot.question(),List.of(),List.of());
            validateAnswer(answer);
            return transaction.execute(status -> {
                var conversation=owned(actor,snapshot.conversationId());
                requireLease(conversation,snapshot.token());
                var request=switches.findLocked(switchId).orElseThrow(InvalidTopicSwitchException::new);
                if (!request.canConfirm(clock.instant())) throw new InvalidTopicSwitchException();
                var next=conversations.saveAndFlush(new AiConversation(actor.userId(),null,
                        ChatTopics.normalize(request.getSuggestedTopic()),"[]",clock.instant()));
                addMessage(next.getId(),"user",request.getQuestion(),List.of());
                addAnswer(next.getId(),answer);
                request.confirm(next.getId());
                conversation.endProcessing(snapshot.token());
                return answerView(next.getId(),next.getId(),answer);
            });
        } finally { release(actor,snapshot.conversationId(),snapshot.token()); }
    }
    @Override
    @Transactional
    public void cancel(Authentication auth, String token, UUID switchId) {
        var actor=actor(auth);
        var conversationId=switches.findConversationId(switchId).orElseThrow(InvalidTopicSwitchException::new);
        var conversation=owned(actor,conversationId);
        if (conversation.processingAt(clock.instant())) throw new ChatBusyException();
        var request=switches.findLocked(switchId).orElseThrow(InvalidTopicSwitchException::new);
        if (!"PENDING".equals(request.getStatus())) throw new InvalidTopicSwitchException();
        request.cancel();
    }
    @Override
    @Transactional
    public List<String> claim(UUID userId, String token) {
        if (token==null || token.isBlank()) return List.of();
        var guest=guest(token);
        var claimed=new ArrayList<String>();
        for (var conversation : conversations.findAllByGuestIdOrderByCreatedAtDesc(guest.getId())) {
            if (messages.existsByConversationId(conversation.getId())) {
                conversation.assignTo(userId); claimed.add(conversation.getId().toString());
            } else conversations.delete(conversation);
        }
        guest.revoke();
        return List.copyOf(claimed);
    }
    private Actor actor(Authentication auth) {
        if (auth==null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof AccountPrincipal principal))
            throw new ChatUnauthorizedException();
        if (auth.getAuthorities().stream().noneMatch(a -> "ROLE_CUSTOMER".equals(a.getAuthority()))
                || auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority())))
            throw new AccessDeniedException("Customer account required");
        return new Actor(principal.id());
    }
    private AiGuestSession guest(String token) {
        if (token==null || token.length()<32 || token.length()>128) throw new ChatUnauthorizedException();
        var session=guests.findLockedByTokenHash(hash(token)).orElseThrow(ChatUnauthorizedException::new);
        if (!session.validAt(clock.instant())) throw new ChatUnauthorizedException();
        return session;
    }
    private AiConversation owned(Actor actor, UUID id) {
        var conversation=conversations.findLocked(id).orElseThrow(ConversationNotFoundException::new);
        boolean owns=actor.userId().equals(conversation.getUserId());
        if (!owns) throw new ConversationNotFoundException();
        return conversation;
    }
    private UUID reserve(AiConversation conversation) {
        if (conversation.processingAt(clock.instant())) throw new ChatBusyException();
        UUID token=UUID.randomUUID();
        conversation.beginProcessing(token,clock.instant());
        return token;
    }
    private void requireLease(AiConversation conversation, UUID token) {
        if (!conversation.ownsProcessing(token,clock.instant())) throw new ChatBusyException();
    }
    private void release(Actor actor, UUID id, UUID token) {
        transaction.executeWithoutResult(status -> conversations.findLocked(id)
                .filter(conversation -> actor.userId().equals(conversation.getUserId()))
                .ifPresent(conversation -> conversation.endProcessing(token)));
    }
    private Map<String,Object> conversationView(AiConversation conversation) {
        var view=new LinkedHashMap<String,Object>();
        String title = conversation.getTitle();
        if (Set.of("PHONE_CONSULTATION", "PHONE_COMPARISON", "GENERAL_CHAT", "SHOP_SUPPORT").contains(title))
            title = ChatTopics.title(conversation.getTopic());
        view.put("id",conversation.getId().toString()); view.put("topic",ChatTopics.normalize(conversation.getTopic())); view.put("title",title);
        view.put("messages",messageViews(conversation.getId()));
        switches.findFirstByConversationIdAndStatus(conversation.getId(),"PENDING")
                .filter(s -> s.canConfirm(clock.instant()))
                .ifPresent(s -> view.put("pendingSwitch",switchView(s,conversation.getTopic())));
        return view;
    }
    private List<ChatMessageResponse> messageViews(UUID id) {
        return messages.findAllByConversationIdOrderByIdAsc(id).stream()
                .map(m -> new ChatMessageResponse(m.getId().toString(),m.getRole(),m.getContent(),List.of(),
                        products(m.getRecommendationsJson()),products(m.getComparisonsJson()))).toList();
    }
    private void addMessage(UUID id, String role, String text, List<ChatResponder.Source> sources) {
        messages.save(new AiMessage(id,role,text,json(sources),"[]","[]",clock.instant()));
    }
    private void addAnswer(UUID id, ChatResponder.Answer answer) {
        messages.save(new AiMessage(id,"assistant",answer.text(),json(answer.sources()),
                json(answer.recommendedProducts()),json(answer.comparedProducts()),clock.instant()));
    }
    private Map<String,Object> switchView(AiTopicSwitch request, String currentTopic) {
        return Map.of("type","SWITCH_REQUIRED","switchRequestId",request.getId().toString(),"currentTopic",ChatTopics.normalize(currentTopic),
                "suggestedTopic",ChatTopics.normalize(request.getSuggestedTopic()),"message","Bạn có muốn chuyển chủ đề để xử lý câu hỏi này không?");
    }
    private Map<String,Object> answerView(UUID id, UUID newId, ChatResponder.Answer answer) {
        var result=new LinkedHashMap<String,Object>(); result.put("type","ANSWER"); result.put("conversationId",id.toString());
        if (newId!=null) result.put("newConversationId",newId.toString());
        result.put("answer",answer.text()); result.put("sources",List.of());
        result.put("recommendedProducts",answer.recommendedProducts()); result.put("comparedProducts",answer.comparedProducts()); return result;
    }
    private static void validateAnswer(ChatResponder.Answer answer) {
        if (answer==null || answer.text()==null || answer.text().isBlank() || answer.sources()==null
                || answer.recommendedProducts()==null || answer.comparedProducts()==null) throw new AiProviderException();
    }
    private String json(Object value) {
        try { return mapper.writeValueAsString(value); } catch (Exception ex) { throw new AiProviderException(); }
    }
    private Map<String,Object> receiptView(String value) {
        try { return mapper.readValue(value,new TypeReference<Map<String,Object>>(){}); }
        catch (Exception ex) { throw new AiProviderException(); }
    }
    private List<ProductResponse> products(String value) {
        try { return mapper.readValue(value,new TypeReference<List<ProductResponse>>(){}); }
        catch (Exception ex) { throw new AiProviderException(); }
    }
    private List<String> productIds(String value) {
        try { return mapper.readValue(value,new TypeReference<List<String>>(){}); }
        catch (Exception ex) { throw new AiProviderException(); }
    }
    private static String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
}
