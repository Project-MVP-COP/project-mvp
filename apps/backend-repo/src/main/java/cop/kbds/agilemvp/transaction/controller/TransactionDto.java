package cop.kbds.agilemvp.transaction.controller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private Long    id;
    private Long    userId;
    private String  transactionDate;
    private String  merchant;
    private Long    categoryId;
    private String  categoryName;
    private Long    amount;
    private String  cardName;
    private Integer installment;
    private String  status;
    private String  memo;
    private String  tag;
}
