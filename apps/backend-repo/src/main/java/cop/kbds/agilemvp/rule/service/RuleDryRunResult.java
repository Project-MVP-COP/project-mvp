package cop.kbds.agilemvp.rule.service;

import java.util.List;

public record RuleDryRunResult(
        int totalCount,
        List<MatchedTransactionDto> transactions
) {}
