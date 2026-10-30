package com.smartphoneai.dto.request;
import jakarta.validation.constraints.NotNull;
public record KnowledgeStatusRequest(@NotNull Boolean enabled) {}
