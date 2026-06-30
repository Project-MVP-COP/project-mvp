package cop.kbds.agilemvp.rule.service;

import cop.kbds.agilemvp.category.repository.CategoryRepository;
import cop.kbds.agilemvp.category.service.Category;
import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.common.exception.CommonErrorCode;
import cop.kbds.agilemvp.rule.exception.RuleErrorCode;
import cop.kbds.agilemvp.rule.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RuleService {

    private final RuleRepository ruleRepository;
    private final CategoryRepository categoryRepository;

    public List<Rule> findAll(Long userId) {
        return ruleRepository.findAllByUserId(userId);
    }

    @Transactional
    public void create(Long userId, String keyword, Long categoryId, String tag) {
        Rule rule = Rule.create(userId, keyword, categoryId, tag);
        if (ruleRepository.existsByUserIdAndKeyword(userId, rule.getKeyword())) {
            throw new BusinessException(RuleErrorCode.DUPLICATE_KEYWORD);
        }
        try {
            ruleRepository.save(rule);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(RuleErrorCode.DUPLICATE_KEYWORD);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException(RuleErrorCode.INVALID_CATEGORY);
        }
        ruleRepository.applyRuleToTransactions(userId, rule.getKeyword(), rule.getCategoryId(), rule.getTag());
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
        Map<String, Category> categoriesByName = new HashMap<>();
        categoryRepository.findAll().forEach(category -> categoriesByName.put(category.getName(), category));

        Map<String, PatternAccumulator> candidates = new HashMap<>();
        for (UnclassifiedTransactionDto transaction : ruleRepository.findUnclassifiedTransactions(userId)) {
            Optional<String> keyword = extractKeyword(transaction.merchant());
            if (keyword.isEmpty()) continue;
            candidates.computeIfAbsent(keyword.get(), PatternAccumulator::new)
                    .add(transaction.merchant(), transaction.amount());
        }

        return candidates.values().stream()
                .filter(candidate -> candidate.occurrences >= 2)
                .sorted(this::comparePatternCandidates)
                .limit(6)
                .map(candidate -> candidate.toRulePattern(categoriesByName))
                .toList();
    }

    private int comparePatternCandidates(PatternAccumulator left, PatternAccumulator right) {
        int byOccurrences = Integer.compare(right.getOccurrences(), left.getOccurrences());
        if (byOccurrences != 0) return byOccurrences;
        int byKeywordLength = Integer.compare(right.getKeywordLength(), left.getKeywordLength());
        if (byKeywordLength != 0) return byKeywordLength;
        return left.getKeyword().compareTo(right.getKeyword());
    }

    private Optional<String> extractKeyword(String merchant) {
        if (merchant == null || merchant.isBlank()) return Optional.empty();
        String firstToken = merchant.trim().split("\\s+")[0]
                .replaceAll("^[\\p{Punct}]+|[\\p{Punct}]+$", "");
        if (firstToken.length() < 2) return Optional.empty();
        if (firstToken.matches("\\d+")) return Optional.empty();
        return Optional.of(firstToken);
    }

    private String recommendCategoryName(String keyword) {
        String value = keyword.toLowerCase(Locale.ROOT);
        if (containsAny(value, "스타벅스", "빽다방", "커피", "카페", "투썸", "이디야")) {
            return "카페인 중독";
        }
        if (containsAny(value, "배달의민족", "요기요", "쿠팡이츠", "땡겨요")) {
            return "식비/식자재";
        }
        if (containsAny(value, "넷플릭스", "왓챠", "디즈니플러스", "유튜브프리미엄")) {
            return "정기 구독";
        }
        if (containsAny(value, "쿠팡", "11번가", "g마켓", "옥션")) {
            return "식비/식자재";
        }
        if (containsAny(value, "교보문고", "알라딘", "예스24")) {
            return "도서/자기계발";
        }
        return "식비/식자재";
    }

    private boolean containsAny(String value, String... patterns) {
        for (String pattern : patterns) {
            if (value.contains(pattern.toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
    }

    private class PatternAccumulator {
        private final String keyword;
        private int occurrences;
        private long totalAmount;
        private String exampleMerchant;

        private PatternAccumulator(String keyword) {
            this.keyword = keyword;
        }

        private void add(String merchant, long amount) {
            occurrences++;
            totalAmount += amount;
            if (exampleMerchant == null) {
                exampleMerchant = merchant;
            }
        }

        private int getOccurrences() {
            return occurrences;
        }

        private int getKeywordLength() {
            return keyword.length();
        }

        private String getKeyword() {
            return keyword;
        }

        private RulePattern toRulePattern(Map<String, Category> categoriesByName) {
            String recommendedCategoryName = recommendCategoryName(keyword);
            Category category = categoriesByName.get(recommendedCategoryName);
            Long recommendedCategoryId = category == null ? null : category.getId();
            return new RulePattern(keyword, occurrences, totalAmount, exampleMerchant,
                    recommendedCategoryId, recommendedCategoryName);
        }
    }
}
