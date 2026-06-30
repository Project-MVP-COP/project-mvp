package cop.kbds.agilemvp.rule.repository;

import cop.kbds.agilemvp.rule.service.MatchedTransactionDto;
import cop.kbds.agilemvp.rule.service.Rule;
import cop.kbds.agilemvp.rule.service.RulePattern;

import java.util.List;

public interface RuleRepository {
    List<Rule> findAllByUserId(Long userId);
    Rule findById(Long id);
    boolean existsByUserIdAndKeyword(Long userId, String keyword);
    void save(Rule rule);
    void deleteById(Long id);
    int applyRuleToTransactions(Long userId, String keyword, Long categoryId, String tag);
    int countMatchedTransactions(Long userId, String keyword);
    List<MatchedTransactionDto> findMatchedTransactions(Long userId, String keyword);
    List<RulePattern> findUnclassifiedPatterns(Long userId);
}
