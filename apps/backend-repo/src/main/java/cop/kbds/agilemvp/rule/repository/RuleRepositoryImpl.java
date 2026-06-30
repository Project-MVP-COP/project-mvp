package cop.kbds.agilemvp.rule.repository;

import cop.kbds.agilemvp.rule.service.MatchedTransactionDto;
import cop.kbds.agilemvp.rule.service.Rule;
import cop.kbds.agilemvp.rule.service.RulePattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class RuleRepositoryImpl implements RuleRepository {
    private final RuleMapper ruleMapper;

    @Override public List<Rule> findAllByUserId(Long userId)                          { return ruleMapper.findAllByUserId(userId); }
    @Override public Rule findById(Long id)                                            { return ruleMapper.findById(id); }
    @Override public void save(Rule rule)                                              { ruleMapper.insert(rule); }
    @Override public void deleteById(Long id)                                          { ruleMapper.deleteById(id); }
    @Override public void applyRuleToTransactions(Long userId, String keyword, Long categoryId, String tag) {
        ruleMapper.applyRuleToTransactions(userId, keyword, categoryId, tag);
    }
    @Override public int countMatchedTransactions(Long userId, String keyword) {
        return ruleMapper.countMatchedTransactions(userId, keyword);
    }
    @Override public List<MatchedTransactionDto> findMatchedTransactions(Long userId, String keyword) {
        return ruleMapper.findMatchedTransactions(userId, keyword);
    }
    @Override public List<RulePattern> findUnclassifiedPatterns(Long userId)          { return ruleMapper.findUnclassifiedPatterns(userId); }
}
