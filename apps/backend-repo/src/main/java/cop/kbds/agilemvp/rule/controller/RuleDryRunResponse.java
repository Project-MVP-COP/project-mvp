package cop.kbds.agilemvp.rule.controller;

import java.util.List;

public record RuleDryRunResponse(
        int matchCount,
        List<MatchedTransaction> transactions
) {
    public record MatchedTransaction(
            Long id,
            String transactionDate,
            String merchant,
            long amount,
            String currentCategory
    ) {}
}
