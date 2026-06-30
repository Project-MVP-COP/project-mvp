package cop.kbds.agilemvp.rule.service;

public record MatchedTransactionDto(
        Long id,
        String transactionDate,
        String merchant,
        long amount,
        String currentCategory
) {}
