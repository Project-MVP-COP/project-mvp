package com.example.demo.excel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private Long id;
    private String date;
    private String merchant;
    private String category;
    private Long amount;
    private String card;
    private Integer installment;
    private String status;
    private String memo;
    private String address;
}
