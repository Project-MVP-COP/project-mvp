package cop.kbds.agilemvp.rule.controller;

import cop.kbds.agilemvp.rule.service.MatchedTransactionDto;

import java.util.List;

public record RuleDryRunResponse(
        int matchCount,
        int newlyClassifiedCount,
        int overrideCount,
        boolean hasOverrideRisk,
        List<MatchedTransaction> transactions
) {
    public record MatchedTransaction(
            Long id,
            String transactionDate,
            String merchant,
            long amount,
            Long currentCategoryId,
            String currentCategory,
            boolean newlyClassified,
            boolean override
    ) {
        public static MatchedTransaction from(MatchedTransactionDto dto) {
            return new MatchedTransaction(dto.id(), dto.transactionDate(), dto.merchant(),
                    dto.amount(), dto.currentCategoryId(), dto.currentCategory(),
                    dto.newlyClassified(), dto.overrideRisk());
        }
    }
}
