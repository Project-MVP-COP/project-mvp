package cop.kbds.agilemvp.rule.controller;

import cop.kbds.agilemvp.rule.service.RulePattern;

public record RulePatternResponse(
        String keyword,
        int occurrences,
        long totalAmount,
        String exampleMerchant,
        Long recommendedCategoryId,
        String recommendedCategoryName
) {
    public static RulePatternResponse from(RulePattern pattern) {
        return new RulePatternResponse(
                pattern.keyword(),
                pattern.occurrences(),
                pattern.totalAmount(),
                pattern.exampleMerchant(),
                pattern.recommendedCategoryId(),
                pattern.recommendedCategoryName()
        );
    }
}
