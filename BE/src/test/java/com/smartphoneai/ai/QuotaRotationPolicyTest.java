package com.smartphoneai.ai;

import com.smartphoneai.service.impl.QuotaRotationPolicy;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class QuotaRotationPolicyTest {
    @Test void prefersNextProjectWhenFirstProjectHasReachedEightyPercent() {
        var candidates=List.of(new QuotaRotationPolicy.Candidate("primary","project-a",1000,800),
                new QuotaRotationPolicy.Candidate("backup","project-b",1000,100));
        assertEquals(List.of("backup","primary"),QuotaRotationPolicy.order(candidates));
    }
    @Test void keysSharingOneProjectShareItsEstimatedUsageAndPriority() {
        var candidates=List.of(new QuotaRotationPolicy.Candidate("primary","same",1000,850),
                new QuotaRotationPolicy.Candidate("same-backup","same",1000,850),
                new QuotaRotationPolicy.Candidate("other","other",1000,100));
        assertEquals(List.of("other","primary","same-backup"),QuotaRotationPolicy.order(candidates));
    }
    @Test void unconfiguredKeysRemainUsableAndAllOverLimitStillAttemptedInPriorityOrder() {
        assertEquals(List.of("one","two"),QuotaRotationPolicy.order(List.of(
                new QuotaRotationPolicy.Candidate("one",null,0,0),
                new QuotaRotationPolicy.Candidate("two","p",100,90))));
        assertEquals(List.of("one","two"),QuotaRotationPolicy.order(List.of(
                new QuotaRotationPolicy.Candidate("one","a",100,90),
                new QuotaRotationPolicy.Candidate("two","b",100,95))));
    }
}
