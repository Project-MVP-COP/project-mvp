package cop.kbds.agilemvp.insight.service;

import java.util.List;

public record InsightCommand(
        String period,
        Long categoryId,
        List<InsightTransaction> transactions
) {
    public record InsightTransaction(
            String transactionDate,
            String merchant,
            Long categoryId,
            String categoryName,
            Long amount,
            String tag,
            String status,
            Boolean isClassified
    ) {}
}
