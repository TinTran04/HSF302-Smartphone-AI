package com.smartphoneai.service.impl;

import java.util.Comparator;
import java.util.List;

public final class QuotaRotationPolicy {
    private QuotaRotationPolicy() {}
    public record Candidate(String key, String project, long limit, long used) {
        boolean nearLimit() { return project != null && limit > 0 && (double) used / limit >= 0.8d; }
    }
    public static List<String> order(List<Candidate> candidates) {
        return candidates.stream().sorted(Comparator.comparing(Candidate::nearLimit))
                .map(Candidate::key).toList();
    }
}
