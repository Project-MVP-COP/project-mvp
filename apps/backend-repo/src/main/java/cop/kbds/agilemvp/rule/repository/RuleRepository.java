package cop.kbds.agilemvp.rule.repository;

import cop.kbds.agilemvp.rule.service.MatchedTransactionDto;
import cop.kbds.agilemvp.rule.service.Rule;
import cop.kbds.agilemvp.rule.service.RuleDryRunSummaryDto;
import cop.kbds.agilemvp.rule.service.UnclassifiedTransactionDto;

import java.util.List;

public interface RuleRepository {
    List<Rule> findAllByUserId(Long userId);
    Rule findById(Long id);
    boolean existsByUserIdAndKeyword(Long userId, String keyword);
    void save(Rule rule);
    void deleteById(Long id);
    int applyRuleToTransactions(Long userId, Long ruleId, String keyword, Long categoryId, String tag);
    int applyRuleToTransactions(Long userId, Long ruleId, String keyword, Long categoryId, String tag, List<Long> transactionIds);
    int restoreRuleAppliedTransactions(Long userId, Long ruleId);
    RuleDryRunSummaryDto summarizeDryRun(Long userId, String keyword, Long categoryId);
    List<MatchedTransactionDto> findMatchedTransactions(Long userId, String keyword, Long categoryId);
    List<UnclassifiedTransactionDto> findUnclassifiedTransactions(Long userId);
}
