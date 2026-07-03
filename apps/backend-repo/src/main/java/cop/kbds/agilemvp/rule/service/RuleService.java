package cop.kbds.agilemvp.rule.service;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.common.exception.CommonErrorCode;
import cop.kbds.agilemvp.rule.exception.RuleErrorCode;
import cop.kbds.agilemvp.rule.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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
        try {
            ruleRepository.save(rule);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException(RuleErrorCode.DUPLICATE_KEYWORD);
        }
        ruleRepository.applyRuleToTransactions(userId, keyword, categoryId, tag);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Rule rule = ruleRepository.findById(id);
        if (rule == null) throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND);
        if (!rule.getUserId().equals(userId)) throw new BusinessException(CommonErrorCode.FORBIDDEN);
        ruleRepository.deleteById(id);
    }

    public RuleDryRunResult dryRun(Long userId, String keyword) {
        int totalCount = ruleRepository.countMatchedTransactions(userId, keyword);
        List<MatchedTransactionDto> transactions = ruleRepository.findMatchedTransactions(userId, keyword);
        return new RuleDryRunResult(totalCount, transactions);
    }

    public List<RulePattern> findUnclassifiedPatterns(Long userId) {
        return ruleRepository.findUnclassifiedPatterns(userId);
    }
}
