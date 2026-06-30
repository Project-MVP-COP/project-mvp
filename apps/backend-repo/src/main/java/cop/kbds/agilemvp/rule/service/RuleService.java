package cop.kbds.agilemvp.rule.service;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.common.exception.CommonErrorCode;
import cop.kbds.agilemvp.rule.controller.RuleDryRunResponse;
import cop.kbds.agilemvp.rule.controller.RulePatternResponse;
import cop.kbds.agilemvp.rule.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RuleService {

    private final RuleRepository ruleRepository;

    public List<Rule> findAll(Long userId) {
        return ruleRepository.findAllByUserId(userId);
    }

    @Transactional
    public void create(Long userId, String keyword, Long categoryId, String tag) {
        Rule rule = Rule.create(userId, keyword, categoryId, tag);
        ruleRepository.save(rule);
        ruleRepository.applyRuleToTransactions(userId, keyword, categoryId, tag);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Rule rule = ruleRepository.findById(id);
        if (rule == null) throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND);
        if (!rule.getUserId().equals(userId)) throw new BusinessException(CommonErrorCode.FORBIDDEN);
        ruleRepository.deleteById(id);
    }

    public RuleDryRunResponse dryRun(Long userId, String keyword) {
        List<RuleDryRunResponse.MatchedTransaction> matched = ruleRepository.findMatchedTransactions(userId, keyword);
        return new RuleDryRunResponse(matched.size(), matched);
    }

    public List<RulePatternResponse> findUnclassifiedPatterns(Long userId) {
        return ruleRepository.findUnclassifiedPatterns(userId);
    }
}
