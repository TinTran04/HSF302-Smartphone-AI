package com.smartphoneai.service;
import java.util.*;
public interface KnowledgeVectorStore {
    record VectorChunk(UUID id, UUID documentId, String documentName, Integer pageNumber, String content) {}
    record Hit(UUID chunkId, double score) {}
    String currentVersion();
    void replace(UUID documentId, String documentName, List<VectorChunk> chunks, String version);
    void delete(UUID documentId);
    List<Hit> search(String question, Set<UUID> documentIds, String version);
}
