package cop.kbds.agilemvp.rule.repository;

import cop.kbds.agilemvp.rule.service.MatchedTransactionDto;
import cop.kbds.agilemvp.rule.service.Rule;
import cop.kbds.agilemvp.rule.service.RuleDryRunSummaryDto;
import cop.kbds.agilemvp.rule.service.UnclassifiedTransactionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class RuleRepositoryImpl implements RuleRepository {
    private final RuleMapper ruleMapper;

    @Override public List<Rule> findAllByUserId(Long userId)                          { return ruleMapper.findAllByUserId(userId); }
    @Override public Rule findById(Long id)                                            { return ruleMapper.findById(id); }
    @Override public boolean existsByUserIdAndKeyword(Long userId, String keyword)      { return ruleMapper.existsByUserIdAndKeyword(userId, keyword); }
    @Override public void save(Rule rule)                                              { ruleMapper.insert(rule); }
    @Override public void deleteById(Long id)                                          { ruleMapper.deleteById(id); }
    @Override public int applyRuleToTransactions(Long userId, String keyword, Long categoryId, String tag) {
        return ruleMapper.applyRuleToTransactions(userId, keyword, categoryId, tag);
    }
    @Override public RuleDryRunSummaryDto summarizeDryRun(Long userId, String keyword, Long categoryId) {
        return ruleMapper.summarizeDryRun(userId, keyword, categoryId);
    }
    @Override public List<MatchedTransactionDto> findMatchedTransactions(Long userId, String keyword, Long categoryId) {
        return ruleMapper.findMatchedTransactions(userId, keyword, categoryId);
    }
    @Override public List<UnclassifiedTransactionDto> findUnclassifiedTransactions(Long userId) {
        return ruleMapper.findUnclassifiedTransactions(userId);
    }
}
