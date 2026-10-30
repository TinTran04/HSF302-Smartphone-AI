package com.smartphoneai.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.*;

@Service
public class AiChatService {
    private static final Set<String> TOPICS=Set.of("PHONE_CONSULTATION","PHONE_COMPARISON","SHOP_SUPPORT","GENERAL_CHAT");
    private final AiGuestSessionRepository guests;
    private final AiConversationRepository conversations;
    private final AiMessageRepository messages;
    private final AiTopicSwitchRepository switches;
    private final TopicRouter router;
    private final ChatResponder responder;
    private final ObjectMapper mapper;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();
    private record Actor(UUID userId, AiGuestSession guest) {}
    public AiChatService(AiGuestSessionRepository guests, AiConversationRepository conversations, AiMessageRepository messages,
                         AiTopicSwitchRepository switches, TopicRouter router, ChatResponder responder, ObjectMapper mapper, Clock clock) {
        this.guests=guests; this.conversations=conversations; this.messages=messages; this.switches=switches;
        this.router=router; this.responder=responder; this.mapper=mapper; this.clock=clock;
    }
    @Transactional
    public String createGuestSession() {
        byte[] bytes=new byte[32]; random.nextBytes(bytes);
        String token=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        guests.save(new AiGuestSession(hash(token), clock.instant()));
        return token;
    }
    @Transactional
    public UUID create(Authentication auth, String token, CreateConversationRequest request) {
        var actor=actor(auth,token);
        var conversation=new AiConversation(actor.userId(), actor.guest()==null ? null : actor.guest().getId(),
                request.topic(), json(request.productIds()==null ? List.of() : request.productIds()), clock.instant());
        return conversations.save(conversation).getId();
    }
    @Transactional
    public List<Map<String,Object>> list(Authentication auth, String token) {
        var actor=actor(auth,token);
        var found=actor.userId()!=null ? conversations.findAllByUserIdOrderByCreatedAtDesc(actor.userId())
                : conversations.findAllByGuestIdOrderByCreatedAtDesc(actor.guest().getId());
        return found.stream().map(this::conversationView).toList();
    }
    @Transactional
    public Map<String,Object> detail(Authentication auth, String token, UUID id) {
        var actor=actor(auth,token); return conversationView(owned(actor,id));
    }
    @Transactional
    public Map<String,Object> send(Authentication auth, String token, UUID id, String rawContent) {
        var actor=actor(auth,token); var conversation=owned(actor,id);
        if (actor.guest()!=null && actor.guest().getMessageCount()>=2) throw new GuestMessageLimitException();
        var pending = switches.findFirstByConversationIdAndStatus(id,"PENDING");
        if (pending.isPresent()) {
            if (pending.get().canConfirm(clock.instant())) throw new InvalidTopicSwitchException();
            pending.get().expire();
        }
        String content=rawContent.trim();
        List<ChatMessageResponse> history=messageViews(id);
        var decision=router.route(conversation.getTopic(),content,history);
        if (decision==null) throw new AiProviderException();
        if ("DIFFERENT_TOPIC".equals(decision.result()) && decision.suggestedTopic()!=null
                && TOPICS.contains(decision.suggestedTopic()) && !conversation.getTopic().equals(decision.suggestedTopic())) {
            addMessage(id,"user",content,List.of());
            var request=switches.save(new AiTopicSwitch(id,decision.suggestedTopic(),content,clock.instant()));
            if (actor.guest()!=null) actor.guest().countMessage();
            return switchView(request,conversation.getTopic());
        }
        if (!"SAME_TOPIC".equals(decision.result())) {
            addMessage(id,"user",content,List.of());
            String clarification="Bạn muốn hỏi về chủ đề nào? Vui lòng nói rõ thêm.";
            addMessage(id,"assistant",clarification,List.of());
            if (actor.guest()!=null) actor.guest().countMessage();
            return Map.of("type","CLARIFICATION_REQUIRED","message",clarification);
        }
        var answer=responder.answer(conversation.getTopic(),content,history,productIds(conversation.getProductIds()));
        validateAnswer(answer);
        addMessage(id,"user",content,List.of()); addAnswer(id,answer);
        if (actor.guest()!=null) actor.guest().countMessage();
        return answerView(id,null,answer);
    }
    @Transactional
    public Map<String,Object> confirm(Authentication auth, String token, UUID switchId) {
        var actor=actor(auth,token);
        var conversationId=switches.findConversationId(switchId).orElseThrow(InvalidTopicSwitchException::new);
        owned(actor,conversationId);
        var request=switches.findLocked(switchId).orElseThrow(InvalidTopicSwitchException::new);
        if ("CONFIRMED".equals(request.getStatus())) {
            var id=request.getNewConversationId();
            var message=messageViews(id).stream().filter(m -> "assistant".equals(m.role())).findFirst().orElseThrow(InvalidTopicSwitchException::new);
            return answerView(id,id,new ChatResponder.Answer(message.content(),message.sources(),message.recommendedProducts(),message.comparedProducts()));
        }
        if (!request.canConfirm(clock.instant())) throw new InvalidTopicSwitchException();
        var answer=responder.answer(request.getSuggestedTopic(),request.getQuestion(),List.of(),List.of());
        validateAnswer(answer);
        var next=conversations.saveAndFlush(new AiConversation(actor.userId(),actor.guest()==null ? null : actor.guest().getId(),
                request.getSuggestedTopic(),"[]",clock.instant()));
        addMessage(next.getId(),"user",request.getQuestion(),List.of());
        addAnswer(next.getId(),answer);
        request.confirm(next.getId());
        return answerView(next.getId(),next.getId(),answer);
    }
    @Transactional
    public void cancel(Authentication auth, String token, UUID switchId) {
        var actor=actor(auth,token);
        var conversationId=switches.findConversationId(switchId).orElseThrow(InvalidTopicSwitchException::new);
        owned(actor,conversationId);
        var request=switches.findLocked(switchId).orElseThrow(InvalidTopicSwitchException::new);
        if (!"PENDING".equals(request.getStatus())) throw new InvalidTopicSwitchException();
        request.cancel();
    }
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
    private Actor actor(Authentication auth, String token) {
        if (auth!=null && auth.getPrincipal() instanceof AccountPrincipal principal) return new Actor(principal.id(),null);
        return new Actor(null,guest(token));
    }
    private AiGuestSession guest(String token) {
        if (token==null || token.length()<32 || token.length()>128) throw new ChatUnauthorizedException();
        var session=guests.findLockedByTokenHash(hash(token)).orElseThrow(ChatUnauthorizedException::new);
        if (!session.validAt(clock.instant())) throw new ChatUnauthorizedException();
        return session;
    }
    private AiConversation owned(Actor actor, UUID id) {
        var conversation=conversations.findLocked(id).orElseThrow(ConversationNotFoundException::new);
        boolean owns=actor.userId()!=null ? actor.userId().equals(conversation.getUserId())
                : actor.guest().getId().equals(conversation.getGuestId());
        if (!owns) throw new ConversationNotFoundException();
        return conversation;
    }
    private Map<String,Object> conversationView(AiConversation conversation) {
        var view=new LinkedHashMap<String,Object>();
        view.put("id",conversation.getId().toString()); view.put("topic",conversation.getTopic()); view.put("title",conversation.getTitle());
        view.put("messages",messageViews(conversation.getId()));
        switches.findFirstByConversationIdAndStatus(conversation.getId(),"PENDING")
                .filter(s -> s.canConfirm(clock.instant()))
                .ifPresent(s -> view.put("pendingSwitch",switchView(s,conversation.getTopic())));
        return view;
    }
    private List<ChatMessageResponse> messageViews(UUID id) {
        return messages.findAllByConversationIdOrderByIdAsc(id).stream()
                .map(m -> new ChatMessageResponse(m.getId().toString(),m.getRole(),m.getContent(),sources(m.getSourcesJson()),
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
        return Map.of("type","SWITCH_REQUIRED","switchRequestId",request.getId().toString(),"currentTopic",currentTopic,
                "suggestedTopic",request.getSuggestedTopic(),"message","Bạn có muốn chuyển chủ đề để xử lý câu hỏi này không?");
    }
    private Map<String,Object> answerView(UUID id, UUID newId, ChatResponder.Answer answer) {
        var result=new LinkedHashMap<String,Object>(); result.put("type","ANSWER"); result.put("conversationId",id.toString());
        if (newId!=null) result.put("newConversationId",newId.toString());
        result.put("answer",answer.text()); result.put("sources",answer.sources());
        result.put("recommendedProducts",answer.recommendedProducts()); result.put("comparedProducts",answer.comparedProducts()); return result;
    }
    private static void validateAnswer(ChatResponder.Answer answer) {
        if (answer==null || answer.text()==null || answer.text().isBlank() || answer.sources()==null
                || answer.recommendedProducts()==null || answer.comparedProducts()==null) throw new AiProviderException();
    }
    private String json(Object value) {
        try { return mapper.writeValueAsString(value); } catch (Exception ex) { throw new AiProviderException(); }
    }
    private List<ChatResponder.Source> sources(String value) {
        try { return mapper.readValue(value,new TypeReference<List<ChatResponder.Source>>(){}); }
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
