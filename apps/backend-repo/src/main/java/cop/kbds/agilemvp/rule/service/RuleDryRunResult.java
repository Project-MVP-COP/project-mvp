package cop.kbds.agilemvp.rule.service;

import java.util.List;

public record RuleDryRunResult(
        int totalCount,
        int newlyClassifiedCount,
        int overrideCount,
        List<MatchedTransactionDto> transactions
) {
    public boolean hasOverrideRisk() {
        return overrideCount > 0;
    }
}
