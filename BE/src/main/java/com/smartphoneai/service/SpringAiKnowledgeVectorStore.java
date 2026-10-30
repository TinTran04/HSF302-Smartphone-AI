package com.smartphoneai.service;

import com.smartphoneai.exception.AiProviderException;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class SpringAiKnowledgeVectorStore implements KnowledgeVectorStore {
    private final JdbcTemplate jdbc;
    private final EmbeddingSettingsService settings;
    private final EmbeddingModelFactory models;
    public SpringAiKnowledgeVectorStore(JdbcTemplate jdbc,EmbeddingSettingsService settings,EmbeddingModelFactory models) {
        this.jdbc=jdbc; this.settings=settings; this.models=models;
    }
    @Override public String currentVersion() { return settings.current().id(); }
    @Override public void replace(UUID documentId,String documentName,List<VectorChunk> chunks,String version) {
        var config=settings.current();
        if (!config.id().equals(version)) throw new AiProviderException();
        try {
            delete(documentId);
            var docs=chunks.stream().map(c -> new Document(c.id().toString(),c.content(),Map.of(
                    "documentId",documentId.toString(),"documentName",documentName,
                    "pageNumber",c.pageNumber()==null ? 0 : c.pageNumber(),"embeddingVersion",version))).toList();
            store(config,false).add(docs);
        } catch (RuntimeException ex) { throw new AiProviderException(); }
    }
    @Override public void delete(UUID documentId) {
        try { jdbc.update("DELETE FROM vector_store WHERE metadata->>'documentId' = ?",documentId.toString()); }
        catch (RuntimeException ex) { throw new AiProviderException(); }
    }
    @Override public List<Hit> search(String question,Set<UUID> documentIds,String version) {
        if (documentIds.isEmpty()) return List.of();
        var config=settings.current();
        if (!config.id().equals(version)) throw new AiProviderException();
        try {
            var filter=new FilterExpressionBuilder();
            var ids=documentIds.stream().map(UUID::toString).toArray();
            var expression=filter.and(filter.in("documentId",ids),filter.eq("embeddingVersion",version)).build();
            return store(config,true).similaritySearch(SearchRequest.builder().query(question).topK(8)
                    .similarityThreshold(0.72).filterExpression(expression).build()).stream()
                    .filter(d -> d.getScore()!=null).map(d -> new Hit(UUID.fromString(d.getId()),d.getScore())).toList();
        } catch (RuntimeException ex) { throw new AiProviderException(); }
    }
    private PgVectorStore store(EmbeddingSettingsService.Active config,boolean query) {
        return PgVectorStore.builder(jdbc,models.create(config.provider(),config.model(),config.key(),config.dimensions(),query))
                .dimensions(config.dimensions()).indexType(PgVectorStore.PgIndexType.NONE).initializeSchema(false).build();
    }
}
