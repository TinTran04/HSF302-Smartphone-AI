package com.smartphoneai.service.support;

import com.smartphoneai.dto.response.ChatMessageResponse;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/** Recognizes catalog model names and resolves unambiguous iPhone shorthand questions. */
public record PhoneModelQuery(String model, Intent intent) {
    public enum Intent { PRICE, BRAND }

    private static final Pattern MODEL = Pattern.compile(
            "\\b(?:(?:iphone|ip)\\s*(\\d{1,2})\\s*(pro\\s*max|pro|plus|mini)?|(\\d{1,2})\\s*(pro\\s*max))\\b");
    private static final Pattern OTHER_MODEL = Pattern.compile(
            "\\b(?:(?:samsung\\s+)?galaxy\\s+(?:[as]\\s*\\d{1,3}(?:\\s*(?:ultra|plus|fe))?|z\\s*(?:flip|fold)\\s*\\d{1,2})"
                    + "|(?:xiaomi\\s+)?redmi\\s+(?:note\\s*)?\\d{1,3}(?:\\s*(?:pro\\s*plus|pro|plus|[45]g))*"
                    + "|(?:oppo|vivo|realme|honor|huawei|oneplus|asus|nokia|xiaomi|poco|(?:google\\s+)?pixel)\\s+"
                    + "(?:find\\s+[a-z]?|reno\\s*|rog\\s+phone\\s*|magic\\s*|mate\\s*|nova\\s*|[a-z])?\\d{1,3}"
                    + "(?:\\s*(?:pro\\s*max|pro|ultra|plus|lite|[45]g))*)\\b");
    private static final Pattern PHONE_QUESTION = Pattern.compile(
            "(?:(?:model|toi|minh|em|anh|chi|ban|cho|hoi|vay|the|con|a|oi|nhe|nhi|co|thi|muon|can|mua|"
                    + "gia|bao|nhieu|tien|may|nay|do|no|la|cua|hang|nao|thuong|hieu|gi|xin|biet|duoc|khong|"
                    + "dien|thoai|chiec|mot|o|shop|hien|tai|voi|ah|ha)(?:\\s+|$))+");
    public static PhoneModelQuery resolve(String question, List<ChatMessageResponse> history) {
        String normalized = normalize(question).replaceAll("[,.!?]", " ").trim();
        var matcher = MODEL.matcher(normalized);
        String model = null;
        String remaining = normalized;
        if (matcher.find()) {
            model = name(matcher.group(1), matcher.group(2), matcher.group(3), matcher.group(4));
            remaining = matcher.replaceFirst("model");
        }
        // A complete vocabulary match prevents unrelated tasks and embedded instructions from opening scope.
        if (!PHONE_QUESTION.matcher(remaining + " ").matches()) return null;
        Intent intent = intent(normalized);
        if (intent == null) return null;
        if (model == null) model = previousModel(history);
        return model == null ? null : new PhoneModelQuery(model, intent);
    }

    public static String modelName(String text) {
        var matcher = MODEL.matcher(normalize(text));
        return matcher.find() ? name(matcher.group(1), matcher.group(2), matcher.group(3), matcher.group(4)) : null;
    }

    public static List<String> mentionedModels(String text) {
        var models = new java.util.LinkedHashSet<String>();
        String normalized = normalize(text);
        var iphones = MODEL.matcher(normalized);
        while (iphones.find()) models.add(name(iphones.group(1), iphones.group(2), iphones.group(3), iphones.group(4)));
        var others = OTHER_MODEL.matcher(normalized);
        while (others.find()) {
            // A budget next to a brand ("Xiaomi 10 triệu") is not a model number.
            if (!normalized.substring(others.end()).stripLeading().matches("^(?:trieu|tr|mah)\\b.*")) models.add(others.group());
        }
        return List.copyOf(models);
    }

    public static boolean matchesModel(String model, String productName) {
        String iphone = modelName(model);
        if (iphone != null) return iphone.equals(modelName(productName));
        String key = modelKey(model);
        return key.equals(modelKey(productName)) || mentionedModels(productName).stream()
                .anyMatch(mentioned -> key.equals(modelKey(mentioned)));
    }

    private static String modelKey(String text) {
        return normalize(text).replaceFirst("^(?:samsung\\s+(?=galaxy)|xiaomi\\s+(?=redmi)|google\\s+(?=pixel))", "")
                .replaceAll("[^a-z0-9]", "");
    }

    private static String previousModel(List<ChatMessageResponse> history) {
        for (int index = history.size() - 1; index >= Math.max(0, history.size() - 8); index--) {
            var message = history.get(index);
            if (!"user".equals(message.role())) continue;
            String text = normalize(message.content()).replaceAll("[,.!?]", " ").trim();
            var matcher = MODEL.matcher(text);
            if (matcher.find()) {
                String model = name(matcher.group(1), matcher.group(2), matcher.group(3), matcher.group(4));
                return PHONE_QUESTION.matcher(matcher.replaceFirst("model") + " ").matches() ? model : null;
            }
            if (!PHONE_QUESTION.matcher(text + " ").matches() || intent(text) == null) return null;
        }
        return null;
    }

    private static Intent intent(String question) {
        boolean price = question.matches(".*\\b(?:gia|tien)\\b.*");
        boolean brand = question.matches(".*\\b(?:hang (?:nao|gi)|thuong hieu)\\b.*");
        if (price && brand) return null;
        if (brand) return Intent.BRAND;
        return price || question.matches(".*\\bmua\\b.*") ? Intent.PRICE : null;
    }

    private static String name(String explicitNumber, String explicitSuffix, String abbreviatedNumber, String abbreviatedSuffix) {
        String number = explicitNumber == null ? abbreviatedNumber : explicitNumber;
        String suffix = explicitNumber == null ? abbreviatedSuffix : explicitSuffix;
        if (suffix == null) return "iPhone " + number;
        return "iPhone " + number + " " + switch (suffix.replaceAll("\\s+", "")) {
            case "promax" -> "Pro Max";
            case "pro" -> "Pro";
            case "plus" -> "Plus";
            default -> "mini";
        };
    }

    private static String normalize(String text) {
        return Normalizer.normalize(text.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").replace('đ', 'd').replaceAll("\\s+", " ");
    }
}
