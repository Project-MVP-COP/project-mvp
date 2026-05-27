package cop.kbds.agilemvp.transaction.repository;

import cop.kbds.agilemvp.transaction.service.Transaction;
import cop.kbds.agilemvp.transaction.controller.TransactionSummary;
import cop.kbds.agilemvp.transaction.controller.TransactionRequest;
import cop.kbds.agilemvp.transaction.controller.TransactionSearchRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TransactionMapper {
    List<Transaction>  findAll();
    Transaction        findById(Long id);
    List<Transaction>  searchList(TransactionSearchRequest params);
    TransactionSummary searchSummary(TransactionSearchRequest params);

    void insert(TransactionRequest req);   // useGeneratedKeys → req.id에 PK 주입
    void update(TransactionRequest req);
    void delete(Long id);
    void deleteAll();

    boolean existsByKey(@Param("userId")          Long   userId,
                        @Param("transactionDate") String transactionDate,
                        @Param("merchant")        String merchant,
                        @Param("amount")          Long   amount,
                        @Param("cardName")        String cardName);
}
