package cop.kbds.agilemvp.transaction.controller;

import cop.kbds.agilemvp.transaction.service.Transaction;

public record TransactionResponse(
        Long   id,
        Long   userId,
        String transactionDate,
        String merchant,
        Long   categoryId,
        String categoryName,
        Long   amount,
        String cardName,
        int    installment,
        String status,
        String memo
) {
    public static TransactionResponse from(Transaction t) {
        return new TransactionResponse(
                t.getId(), t.getUserId(), t.getTransactionDate(), t.getMerchant(),
                t.getCategoryId(), t.getCategoryName(), t.getAmount(), t.getCardName(),
                t.getInstallment(), t.getStatus(), t.getMemo()
        );
    }
}
