package cop.kbds.agilemvp.rule.service;

public record RulePattern(
        String keyword,
        int occurrences,
        long totalAmount,
        String exampleMerchant,
        Long recommendedCategoryId,
        String recommendedCategoryName
) {}
