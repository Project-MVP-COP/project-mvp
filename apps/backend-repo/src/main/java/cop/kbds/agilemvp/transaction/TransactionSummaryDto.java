package cop.kbds.agilemvp.transaction;

import lombok.Data;

@Data
public class TransactionSummaryDto {
    private long totalCount;
    private long approvedCount;
    private long cancelledCount;
    private long totalAmount;
}
