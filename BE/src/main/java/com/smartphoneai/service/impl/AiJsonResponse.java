package com.smartphoneai.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.regex.Pattern;

final class AiJsonResponse {
    private static final Pattern MARKDOWN_JSON = Pattern.compile(
            "\\A```(?:json)?[\\t ]*\\R(.*)\\R```\\z", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    private AiJsonResponse() {}

    static JsonNode readTree(ObjectMapper mapper, String response) throws JsonProcessingException {
        String json = response.strip();
        var markdown = MARKDOWN_JSON.matcher(json);
        if (markdown.matches()) json = markdown.group(1);
        JsonNode node = mapper.reader().with(DeserializationFeature.FAIL_ON_TRAILING_TOKENS).readTree(json);
        if (node == null || !node.isObject()) throw new IllegalArgumentException("AI response must be a JSON object");
        return node;
    }
}
