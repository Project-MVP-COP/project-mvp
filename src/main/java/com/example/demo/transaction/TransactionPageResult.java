package com.example.demo.transaction;

import com.example.demo.excel.dto.TransactionDto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TransactionPageResult {
    private long totalCount;
    private long approvedCount;
    private long cancelledCount;
    private long totalAmount;
    private boolean hasMore;
    private List<TransactionDto> data;
}
