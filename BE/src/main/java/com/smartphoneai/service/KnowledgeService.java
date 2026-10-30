package com.smartphoneai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.dto.response.KnowledgeDocumentResponse;
import com.smartphoneai.entity.KnowledgeDocument;
import com.smartphoneai.exception.InvalidKnowledgeFileException;
import com.smartphoneai.exception.KnowledgeNotFoundException;
import com.smartphoneai.repository.KnowledgeChunkRepository;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class KnowledgeService {
    private final KnowledgeDocumentRepository documents;
    private final KnowledgeChunkRepository chunks;
    private final KnowledgeVectorStore vectors;
    private final KnowledgeTextExtractor extractor;
    private final ObjectMapper mapper;
    private final Clock clock;
    public KnowledgeService(KnowledgeDocumentRepository documents, KnowledgeChunkRepository chunks, KnowledgeVectorStore vectors,
                            KnowledgeTextExtractor extractor, ObjectMapper mapper, Clock clock) {
        this.documents=documents; this.chunks=chunks; this.vectors=vectors; this.extractor=extractor; this.mapper=mapper; this.clock=clock;
    }
    @Transactional
    public UUID create(MultipartFile file) {
        var parsed=parse(file);
        return documents.save(new KnowledgeDocument(parsed.name(),file.getSize(),parsed.pagesJson(),clock.instant())).getId();
    }
    @Transactional
    public void replace(UUID id, MultipartFile file) {
        var parsed=parse(file);
        var doc=documents.findLocked(id).orElseThrow(KnowledgeNotFoundException::new);
        doc.replaceContent(parsed.name(),file.getSize(),parsed.pagesJson(),clock.instant());
    }
    @Transactional(readOnly=true)
    public KnowledgeDocumentResponse get(UUID id) { return KnowledgeDocumentResponse.from(documents.findById(id).orElseThrow(KnowledgeNotFoundException::new)); }
    @Transactional(readOnly=true)
    public List<KnowledgeDocumentResponse> list() { return documents.findAllByOrderByContentUpdatedAtDesc().stream().map(KnowledgeDocumentResponse::from).toList(); }
    @Transactional
    public KnowledgeDocumentResponse enabled(UUID id, boolean enabled) {
        var doc=documents.findLocked(id).orElseThrow(KnowledgeNotFoundException::new);
        doc.setEnabled(enabled); return KnowledgeDocumentResponse.from(doc);
    }
    @Transactional
    public void delete(UUID id) {
        var doc=documents.findLocked(id).orElseThrow(KnowledgeNotFoundException::new);
        vectors.delete(id); chunks.deleteAllByDocumentId(id); chunks.flush(); documents.delete(doc);
    }
    @Transactional
    public void markFailed(UUID id, UUID attempt) {
        var document = documents.findLocked(id).orElseThrow(KnowledgeNotFoundException::new);
        if ("PROCESSING".equals(document.getStatus()) && java.util.Objects.equals(attempt, document.getProcessingAttempt()))
            document.fail();
    }
    @Transactional(readOnly=true)
    public UUID processingAttempt(UUID id) {
        return documents.findById(id).orElseThrow(KnowledgeNotFoundException::new).getProcessingAttempt();
    }
    @Transactional
    public KnowledgeDocumentResponse markProcessing(UUID id) {
        var document = documents.findLocked(id).orElseThrow(KnowledgeNotFoundException::new);
        document.startProcessing();
        return KnowledgeDocumentResponse.from(document);
    }
    private record Parsed(String name,String pagesJson) {}
    private Parsed parse(MultipartFile file) {
        if (file==null || file.getSize()==0 || file.getSize()>10*1024*1024) throw new InvalidKnowledgeFileException();
        String raw=file.getOriginalFilename();
        if (raw==null) throw new InvalidKnowledgeFileException();
        raw=raw.replace('\\','/'); String name=raw.substring(raw.lastIndexOf('/')+1);
        if (name.isBlank() || name.length()>255) throw new InvalidKnowledgeFileException();
        try { return new Parsed(name,mapper.writeValueAsString(extractor.extract(name,file.getBytes()))); }
        catch (InvalidKnowledgeFileException ex) { throw ex; }
        catch (Exception ex) { throw new InvalidKnowledgeFileException(); }
    }
}
