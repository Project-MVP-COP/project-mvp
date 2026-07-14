package cop.kbds.agilemvp.rule.service;

public record MatchedTransactionDto(
        Long id,
        String transactionDate,
        String merchant,
        long amount,
        Long currentCategoryId,
        String currentCategory,
        boolean newlyClassified,
        boolean overrideRisk
) {}
