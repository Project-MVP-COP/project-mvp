package cop.kbds.agilemvp.transaction.controller;

import java.util.List;

public record TransactionPageResponse(
        long totalCount,
        long approvedCount,
        long cancelledCount,
        long totalAmount,
        boolean hasMore,
        List<TransactionResponse> data
) {}
