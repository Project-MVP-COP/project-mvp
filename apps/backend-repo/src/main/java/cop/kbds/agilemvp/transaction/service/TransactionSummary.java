package cop.kbds.agilemvp.transaction.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TransactionSummary {
    private final Long totalCount;
    private final Long approvedCount;
    private final Long cancelledCount;
    private final Long totalAmount;
}
