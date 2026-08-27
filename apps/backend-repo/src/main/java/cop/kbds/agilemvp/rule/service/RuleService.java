package cop.kbds.agilemvp.rule.service;

import cop.kbds.agilemvp.category.repository.CategoryRepository;
import cop.kbds.agilemvp.category.service.Category;
import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.common.exception.CommonErrorCode;
import cop.kbds.agilemvp.common.util.SqlLikeUtil;
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
        if (categoryRepository.findByIdAvailable(rule.getCategoryId(), userId) == null) {
            throw new BusinessException(RuleErrorCode.INVALID_CATEGORY);
        }
        try {
            ruleRepository.save(rule);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(RuleErrorCode.DUPLICATE_KEYWORD);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException(RuleErrorCode.INVALID_CATEGORY);
        }
        ruleRepository.applyRuleToTransactions(userId, rule.getId(), SqlLikeUtil.escape(rule.getKeyword()),
                rule.getCategoryId(), rule.getTag());
    }

    @Transactional
    public void delete(Long id, Long userId, boolean restoreTransactions) {
        Rule rule = ruleRepository.findById(id);
        if (rule == null) throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND);
        if (!rule.getUserId().equals(userId)) throw new BusinessException(CommonErrorCode.FORBIDDEN);
        if (restoreTransactions) {
            ruleRepository.restoreRuleAppliedTransactions(userId, rule.getId());
        }
        ruleRepository.deleteById(id);
    }

    public RuleDryRunResult dryRun(Long userId, String keyword, Long categoryId) {
        Rule rule = Rule.create(userId, keyword, categoryId, null);
        if (categoryRepository.findByIdAvailable(rule.getCategoryId(), userId) == null) {
            throw new BusinessException(RuleErrorCode.INVALID_CATEGORY);
        }

        RuleDryRunSummaryDto summary = ruleRepository.summarizeDryRun(
                userId, SqlLikeUtil.escape(rule.getKeyword()), rule.getCategoryId());
        List<MatchedTransactionDto> transactions = ruleRepository.findMatchedTransactions(
                userId, SqlLikeUtil.escape(rule.getKeyword()), rule.getCategoryId());
        return new RuleDryRunResult(
                summary.matchCount(),
                summary.newlyClassifiedCount(),
                summary.overrideCount(),
                transactions
        );
    }

    public List<RulePattern> findUnclassifiedPatterns(Long userId) {
        Map<String, Category> categoriesByName = new HashMap<>();
        categoryRepository.findAllAvailable(userId).forEach(category -> categoriesByName.put(category.getName(), category));

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
        String normalized = merchant.trim()
                .replaceFirst("[\\(（\\[\\{].*$", "")
                .trim();
        if (normalized.isBlank()) return Optional.empty();

        String firstToken = normalized.split("\\s+")[0]
                .replaceAll("^[\\p{P}\\p{S}]+|[\\p{P}\\p{S}]+$", "");
        if (firstToken.length() < 2) return Optional.empty();
        if (firstToken.matches("\\d+")) return Optional.empty();
        return Optional.of(firstToken);
    }

    private String recommendCategoryName(String keyword) {
        String value = keyword.toLowerCase(Locale.ROOT);
        if (containsAny(value, "gs25", "세븐일레븐", "7-eleven", "cu편의점", "씨유", "이마트24",
                "미니스톱", "스토리웨이", "바이더웨이")) {
            return "편의점";
        }
        if (containsAny(value, "배달의민족", "요기요", "쿠팡이츠", "땡겨요", "배달특급")) {
            return "식음료";
        }
        if (containsAny(value, "스타벅스", "빽다방", "커피", "카페", "투썸", "이디야", "메가mgc",
                "컴포즈커피", "맥도날드", "버거킹", "롯데리아", "김밥", "식당", "베이커리")) {
            return "식음료";
        }
        if (containsAny(value, "넷플릭스", "왓챠", "디즈니플러스", "유튜브프리미엄", "티빙", "웨이브",
                "쿠팡플레이", "cgv", "롯데시네마", "메가박스", "멜론", "스포티파이")) {
            return "문화/여가";
        }
        if (containsAny(value, "교보문고", "알라딘", "예스24", "yes24", "인프런", "클래스101", "학원",
                "교습소", "학교", "대학교", "교재")) {
            return "교육";
        }
        if (containsAny(value, "쿠팡", "쿠페이", "11번가", "g마켓", "gmarket", "옥션", "위메프", "티몬",
                "네이버쇼핑", "마켓컬리", "컬리", "무신사", "이마트", "롯데마트", "홈플러스",
                "코스트코", "농협하나로", "하나로마트", "로컬푸드", "직매장", "다이소", "올리브영")) {
            return "쇼핑";
        }
        if (containsAny(value, "티머니", "교통카드", "지하철", "버스", "코레일", "ktx", "srt", "택시",
                "쏘카", "렌터카", "렌트카", "대한항공", "아시아나")) {
            return "교통";
        }
        if (containsAny(value, "병원", "의원", "클리닉", "한의원", "치과", "약국", "헬스장", "피트니스",
                "필라테스", "요가")) {
            return "의료/건강";
        }
        if (containsAny(value, "sk에너지", "gs칼텍스", "현대오일뱅크", "s-oil", "에쓰오일", "주유소",
                "전기차충전", "ev충전")) {
            return "주유";
        }
        if (containsAny(value, "sk텔레콤", "skt", "kt올레", "lg유플러스", "lgu+", "알뜰폰", "헬로모바일")) {
            return "통신";
        }
        return "기타";
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
