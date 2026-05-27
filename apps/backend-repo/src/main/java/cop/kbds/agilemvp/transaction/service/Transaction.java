package cop.kbds.agilemvp.transaction.service;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 도메인 엔티티. 불변 객체. DB 재구성은 @AllArgsConstructor (MyBatis constructor 매핑),
 * 신규 생성은 create() 정적 팩토리만 허용.
 */
@Getter
@AllArgsConstructor
@Builder(access = AccessLevel.PRIVATE)
public class Transaction {
    private final Long    id;
    private final Long    userId;
    private final String  transactionDate;
    private final String  merchant;
    private final Long    categoryId;
    private final String  categoryName;
    private final Long    amount;
    private final String  cardName;
    private final Integer installment;
    private final String  status;
    private final String  memo;

    public static Transaction create(Long userId, String transactionDate, String merchant,
                                     Long categoryId, Long amount, String cardName,
                                     Integer installment, String status, String memo) {
        return Transaction.builder()
                .userId(userId)
                .transactionDate(transactionDate)
                .merchant(merchant)
                .categoryId(categoryId)
                .amount(amount)
                .cardName(cardName)
                .installment(installment)
                .status(status)
                .memo(memo)
                .build();
    }
}
