package cop.kbds.agilemvp.transaction.controller;

public record TransactionSummary(
        Long totalCount,
        Long approvedCount,
        Long cancelledCount,
        Long totalAmount
) {}
