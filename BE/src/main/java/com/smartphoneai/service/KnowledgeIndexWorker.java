package com.smartphoneai.service;

import java.util.UUID;

public interface KnowledgeIndexWorker {
    void index(UUID id, UUID attempt);
}
