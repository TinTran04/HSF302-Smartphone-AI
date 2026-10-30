package com.smartphoneai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.KnowledgeChunk;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.KnowledgeNotFoundException;
import com.smartphoneai.repository.KnowledgeChunkRepository;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import com.smartphoneai.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class KnowledgeIndexWorker {
    private final KnowledgeDocumentRepository documents;
    private final KnowledgeChunkRepository chunks;
    private final KnowledgeVectorStore vectors;
    private final KnowledgeTextExtractor extractor;
    private final ObjectMapper mapper;
    private final SystemSettingRepository settings;
    public KnowledgeIndexWorker(KnowledgeDocumentRepository documents, KnowledgeChunkRepository chunks,
                                KnowledgeVectorStore vectors, KnowledgeTextExtractor extractor, ObjectMapper mapper, SystemSettingRepository settings) {
        this.documents=documents; this.chunks=chunks; this.vectors=vectors; this.extractor=extractor; this.mapper=mapper; this.settings=settings;
    }
    @Transactional
    public void index(UUID id, UUID attempt) {
        settings.findLockedSingleton().orElseThrow();
        var doc=documents.findLocked(id).orElseThrow(KnowledgeNotFoundException::new);
        if (!"PROCESSING".equals(doc.getStatus()) || !java.util.Objects.equals(attempt, doc.getProcessingAttempt())) return;
        doc.processing();
        String version=vectors.currentVersion();
        if (version==null || version.isBlank()) throw new AiProviderException();
        List<KnowledgeTextExtractor.Page> pages;
        try { pages=mapper.readValue(doc.getPagesJson(),new TypeReference<List<KnowledgeTextExtractor.Page>>(){}); }
        catch (Exception ex) { throw new AiProviderException(); }
        var newChunks=extractor.split(pages).stream().map(c -> new KnowledgeChunk(id,c.pageNumber(),c.text(),version)).toList();
        if (newChunks.isEmpty()) throw new AiProviderException();
        var vectorChunks=newChunks.stream().map(c -> new KnowledgeVectorStore.VectorChunk(c.getId(),id,doc.getName(),c.getPageNumber(),c.getContent())).toList();
        vectors.replace(id,doc.getName(),vectorChunks,version);
        chunks.deleteAllByDocumentId(id); chunks.flush(); chunks.saveAll(newChunks);
        doc.ready(version);
    }
}
