package cop.kbds.agilemvp.transaction.repository;

import cop.kbds.agilemvp.transaction.controller.TransactionDto;
import cop.kbds.agilemvp.transaction.controller.TransactionSearchDto;
import cop.kbds.agilemvp.transaction.controller.TransactionSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class TransactionRepositoryImpl implements TransactionRepository {
    private final TransactionMapper transactionMapper;

    @Override public List<TransactionDto>  findAll(Long userId)                  { return transactionMapper.findAll(userId); }
    @Override public List<TransactionDto>  searchList(TransactionSearchDto p)    { return transactionMapper.searchList(p); }
    @Override public TransactionSummaryDto searchSummary(TransactionSearchDto p) { return transactionMapper.searchSummary(p); }
    @Override public TransactionDto        findById(Long id)                     { return transactionMapper.findById(id); }
    @Override public void insert(TransactionDto dto)                             { transactionMapper.insert(dto); }
    @Override public void update(TransactionDto dto)                             { transactionMapper.update(dto); }
    @Override public void updateCategory(Long id, Long categoryId, String tag)    { transactionMapper.updateCategory(id, categoryId, tag); }
    @Override public void updateTag(Long id, String tag)                         { transactionMapper.updateTag(id, tag); }
    @Override public void delete(Long id)                                        { transactionMapper.delete(id); }
    @Override public void deleteAll(Long userId)                                 { transactionMapper.deleteAll(userId); }
}
