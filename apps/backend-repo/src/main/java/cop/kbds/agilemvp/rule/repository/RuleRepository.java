package cop.kbds.agilemvp.rule.repository;

import cop.kbds.agilemvp.rule.controller.RuleDryRunResponse;
import cop.kbds.agilemvp.rule.controller.RulePatternResponse;
import cop.kbds.agilemvp.rule.service.Rule;

import java.util.List;

public interface RuleRepository {
    List<Rule> findAllByUserId(Long userId);
    Rule findById(Long id);
    void save(Rule rule);
    void deleteById(Long id);
    void applyRuleToTransactions(Long userId, String keyword, Long categoryId, String tag);
    List<RuleDryRunResponse.MatchedTransaction> findMatchedTransactions(Long userId, String keyword);
    List<RulePatternResponse> findUnclassifiedPatterns(Long userId);
}
