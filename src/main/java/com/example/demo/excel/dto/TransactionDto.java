package com.example.demo.excel.dto;

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
    private String  transactionDate;  // DATE as "YYYY-MM-DD"
    private String  merchant;
    private Long    categoryId;
    private String  categoryName;     // from JOIN for display; also used as input for name→id resolution
    private Long    amount;
    private String  cardName;
    private Integer installment;
    private String  status;
    private String  memo;
}
