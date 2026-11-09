package com.smartphoneai.knowledge;

import com.smartphoneai.service.support.EmbeddingModelFactory;
import com.smartphoneai.service.EmbeddingSettingsService;
import com.smartphoneai.service.KnowledgeVectorStore;
import com.smartphoneai.service.impl.SpringAiKnowledgeVectorStore;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PostgresVectorIntegrationTest {
    @Test void indexesAndRetrievesMatchingDocumentFromPgvector() {
        String url = System.getenv("TEST_POSTGRES_URL");
        assumeTrue(url != null && !url.isBlank(), "Requires a disposable PostgreSQL test database migrated to V20");
        var dataSource = new DriverManagerDataSource(url, System.getenv("TEST_POSTGRES_USERNAME"), System.getenv("TEST_POSTGRES_PASSWORD"));
        var jdbc = new JdbcTemplate(dataSource);
        var settings = mock(EmbeddingSettingsService.class);
        var factory = mock(EmbeddingModelFactory.class);
        var config = new EmbeddingSettingsService.Active("test-version", "GEMINI", "test", "unused", 3);
        when(settings.current()).thenReturn(config);
        EmbeddingModel model = new EmbeddingModel() {
            private float[] vector(String text) { return text.contains("warranty") ? new float[] {1, 0, 0} : new float[] {0, 1, 0}; }
            @Override public float[] embed(Document document) { return vector(document.getText()); }
            @Override public EmbeddingResponse call(EmbeddingRequest request) {
                return new EmbeddingResponse(IntStream.range(0, request.getInstructions().size())
                        .mapToObj(i -> new Embedding(vector(request.getInstructions().get(i)), i)).toList());
            }
        };
        when(factory.create(anyString(), anyString(), anyString(), anyInt(), anyBoolean())).thenReturn(model);
        var store = new SpringAiKnowledgeVectorStore(jdbc, settings, factory);
        UUID wanted = UUID.randomUUID(), other = UUID.randomUUID(), chunk = UUID.randomUUID();
        try {
            store.replace(wanted, "warranty.txt", List.of(new KnowledgeVectorStore.VectorChunk(chunk, wanted, "warranty.txt", 1, "warranty policy")), config.id());
            store.replace(other, "other.txt", List.of(new KnowledgeVectorStore.VectorChunk(UUID.randomUUID(), other, "other.txt", 1, "other policy")), config.id());
            var hits = store.search("warranty", Set.of(wanted), config.id());
            assertEquals(1, hits.size());
            assertEquals(chunk, hits.getFirst().chunkId());
            assertTrue(hits.getFirst().score() >= 0.72);
        } finally { store.delete(wanted); store.delete(other); }
    }
}
