package cop.kbds.agilemvp.transaction.repository;

import cop.kbds.agilemvp.transaction.service.Transaction;
import cop.kbds.agilemvp.transaction.controller.TransactionSummary;
import cop.kbds.agilemvp.transaction.controller.TransactionRequest;
import cop.kbds.agilemvp.transaction.controller.TransactionSearchRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class TransactionRepositoryImpl implements TransactionRepository {

    private final TransactionMapper transactionMapper;

    @Override
    public List<Transaction> findAll() {
        return transactionMapper.findAll();
    }

    @Override
    public Transaction findById(Long id) {
        return transactionMapper.findById(id);
    }

    @Override
    public List<Transaction> searchList(TransactionSearchRequest params) {
        return transactionMapper.searchList(params);
    }

    @Override
    public TransactionSummary searchSummary(TransactionSearchRequest params) {
        return transactionMapper.searchSummary(params);
    }

    @Override
    public void insert(TransactionRequest req) {
        transactionMapper.insert(req);
    }

    @Override
    public void update(TransactionRequest req) {
        transactionMapper.update(req);
    }

    @Override
    public void delete(Long id) {
        transactionMapper.delete(id);
    }

    @Override
    public void deleteAll() {
        transactionMapper.deleteAll();
    }

    @Override
    public boolean existsByKey(Long userId, String transactionDate, String merchant, Long amount, String cardName) {
        return transactionMapper.existsByKey(userId, transactionDate, merchant, amount, cardName);
    }
}
