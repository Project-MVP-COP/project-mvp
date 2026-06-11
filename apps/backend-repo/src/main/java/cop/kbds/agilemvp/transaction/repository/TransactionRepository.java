package cop.kbds.agilemvp.transaction.repository;

import cop.kbds.agilemvp.transaction.controller.TransactionDto;
import cop.kbds.agilemvp.transaction.controller.TransactionSearchDto;
import cop.kbds.agilemvp.transaction.controller.TransactionSummaryDto;

import java.util.List;

public interface TransactionRepository {
    List<TransactionDto> findAll(Long userId);
    List<TransactionDto> searchList(TransactionSearchDto params);
    TransactionSummaryDto searchSummary(TransactionSearchDto params);
    TransactionDto findById(Long id);
    void insert(TransactionDto dto);
    void update(TransactionDto dto);
    void updateCategory(Long id, Long categoryId);
    void delete(Long id);
    void deleteAll(Long userId);
}
