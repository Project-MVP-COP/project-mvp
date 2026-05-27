package cop.kbds.agilemvp.transaction.web;

import cop.kbds.agilemvp.transaction.service.Transaction;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TransactionResponse {
    private final Long   id;
    private final Long   userId;
    private final String transactionDate;
    private final String merchant;
    private final Long   categoryId;
    private final String categoryName;
    private final Long   amount;
    private final String cardName;
    private final int    installment;
    private final String status;
    private final String memo;

    public static TransactionResponse from(Transaction t) {
        return new TransactionResponse(
                t.getId(), t.getUserId(), t.getTransactionDate(), t.getMerchant(),
                t.getCategoryId(), t.getCategoryName(), t.getAmount(), t.getCardName(),
                t.getInstallment(), t.getStatus(), t.getMemo()
        );
    }
}
