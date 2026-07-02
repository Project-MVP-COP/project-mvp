package cop.kbds.agilemvp.rule.service;

import cop.kbds.agilemvp.category.exception.CategoryErrorCode;
import cop.kbds.agilemvp.category.service.CategoryService;
import cop.kbds.agilemvp.common.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class RuleServiceIntegrationTest {

    @Autowired
    private RuleService ruleService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("규칙 삭제 복원은 해당 규칙이 적용한 거래만 되돌린다")
    void deleteWithRestore_RestoresOnlyRuleAppliedTransactions() {
        Long userId = createUser("restore-user", "복원유저");
        Long foodId = categoryId("식음료");

        Long appliedTargetId = insertTransaction(userId, "2026-07-01", "스타벅스 강남점", null, 6200L, null, false);
        Long manualTargetId = insertTransaction(userId, "2026-07-02", "스타벅스 수동분류", foodId, 7000L, "#커피", true);

        ruleService.create(userId, "스타벅스", foodId, "커피");
        Long ruleId = ruleId(userId, "스타벅스");

        ruleService.delete(ruleId, userId, true);

        Map<String, Object> restored = transaction(appliedTargetId);
        assertThat(restored.get("CATEGORY_ID")).isNull();
        assertThat(restored.get("TAG")).isNull();
        assertThat(restored.get("IS_CLASSIFIED")).isEqualTo(false);
        assertThat(restored.get("APPLIED_RULE_ID")).isNull();

        Map<String, Object> manual = transaction(manualTargetId);
        assertThat(((Number) manual.get("CATEGORY_ID")).longValue()).isEqualTo(foodId);
        assertThat(manual.get("TAG")).isEqualTo("#커피");
        assertThat(manual.get("IS_CLASSIFIED")).isEqualTo(true);
        assertThat(manual.get("APPLIED_RULE_ID")).isNull();
    }

    @Test
    @DisplayName("규칙 키워드의 LIKE 메타문자는 일반 문자로 매칭한다")
    void create_EscapesLikeWildcardKeyword() {
        Long userId = createUser("wildcard-user", "와일드유저");
        Long foodId = categoryId("식음료");

        Long percentMerchantId = insertTransaction(userId, "2026-07-03", "100%커피", null, 5000L, null, false);
        Long normalMerchantId = insertTransaction(userId, "2026-07-04", "100원커피", null, 5000L, null, false);

        ruleService.create(userId, "100%", foodId, "이벤트");

        assertThat(transaction(percentMerchantId).get("IS_CLASSIFIED")).isEqualTo(true);
        assertThat(transaction(normalMerchantId).get("IS_CLASSIFIED")).isEqualTo(false);
    }

    @Test
    @DisplayName("패턴 추천 카테고리는 실제 기본 카테고리 ID와 함께 반환한다")
    void findUnclassifiedPatterns_ReturnsExistingRecommendedCategory() {
        Long userId = createUser("pattern-user", "패턴유저");
        Long foodId = categoryId("식음료");
        insertTransaction(userId, "2026-07-05", "스타벅스 강남점", null, 6200L, null, false);
        insertTransaction(userId, "2026-07-06", "스타벅스 선릉점", null, 6100L, null, false);

        List<RulePattern> patterns = ruleService.findUnclassifiedPatterns(userId);

        RulePattern starbucks = patterns.stream()
                .filter(pattern -> pattern.keyword().equals("스타벅스"))
                .findFirst()
                .orElseThrow();
        assertThat(starbucks.recommendedCategoryName()).isEqualTo("식음료");
        assertThat(starbucks.recommendedCategoryId()).isEqualTo(foodId);
    }

    @Test
    @DisplayName("카테고리 삭제 시 연결된 거래는 미분류 상태로 동기화한다")
    void deleteCategory_DetachesTransactions() {
        Long userId = createUser("category-user", "카테고리유저");
        Long categoryId = createCategory(userId, "반려동물");
        Long transactionId = insertTransaction(userId, "2026-07-07", "동물병원", categoryId, 30000L, "#수동", true);

        categoryService.delete(categoryId, userId);

        Map<String, Object> transaction = transaction(transactionId);
        assertThat(transaction.get("CATEGORY_ID")).isNull();
        assertThat(transaction.get("TAG")).isEqualTo("#수동");
        assertThat(transaction.get("IS_CLASSIFIED")).isEqualTo(false);
        assertThat(transaction.get("APPLIED_RULE_ID")).isNull();
    }

    @Test
    @DisplayName("규칙에서 사용하는 카테고리는 삭제할 수 없다")
    void deleteCategory_WhenUsedByRule_ThrowsConflict() {
        Long userId = createUser("rule-category-user", "규칙카테고리유저");
        Long categoryId = createCategory(userId, "구독관리");
        ruleService.create(userId, "넷플릭스", categoryId, "구독");

        assertThatThrownBy(() -> categoryService.delete(categoryId, userId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(CategoryErrorCode.CATEGORY_IN_USE.getMessage());
    }

    @Test
    @DisplayName("커스텀 카테고리는 사용자별로 격리된다")
    void customCategory_IsScopedByUser() {
        Long userA = createUser("category-owner-a", "카테고리소유자A");
        Long userB = createUser("category-owner-b", "카테고리소유자B");

        Long userACategoryId = createCategory(userA, "개인카테고리");

        assertThat(categoryService.findAll(userA))
                .extracting("id")
                .contains(userACategoryId);
        assertThat(categoryService.findAll(userB))
                .extracting("id")
                .doesNotContain(userACategoryId);
        assertThatThrownBy(() -> ruleService.create(userB, "개인", userACategoryId, "태그"))
                .isInstanceOf(BusinessException.class);
    }

    private Long createUser(String loginId, String nickname) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO users (login_id, nickname, password_hash)
                    VALUES (?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, loginId);
            ps.setString(2, nickname);
            ps.setString(3, "{noop}password");
            return ps;
        }, keyHolder);
        return generatedId(keyHolder);
    }

    private Long categoryId(String name) {
        return jdbcTemplate.queryForObject("SELECT id FROM categories WHERE name = ?", Long.class, name);
    }

    private Long createCategory(Long userId, String name) {
        categoryService.create(userId, name, "#123456");
        return jdbcTemplate.queryForObject(
                "SELECT id FROM categories WHERE user_id = ? AND name = ?",
                Long.class, userId, name);
    }

    private Long ruleId(Long userId, String keyword) {
        return jdbcTemplate.queryForObject(
                "SELECT id FROM mapping_rules WHERE user_id = ? AND keyword = ?",
                Long.class, userId, keyword);
    }

    private Long insertTransaction(Long userId, String date, String merchant, Long categoryId,
                                   Long amount, String tag, boolean isClassified) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                    INSERT INTO transactions
                        (user_id, transaction_date, merchant, category_id, amount, card_name,
                         installment, status, tag, is_classified)
                    VALUES (?, CAST(? AS DATE), ?, ?, ?, ?, 1, '승인', ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, userId);
            ps.setString(2, date);
            ps.setString(3, merchant);
            if (categoryId == null) {
                ps.setObject(4, null);
            } else {
                ps.setLong(4, categoryId);
            }
            ps.setLong(5, amount);
            ps.setString(6, "테스트카드");
            ps.setString(7, tag);
            ps.setBoolean(8, isClassified);
            return ps;
        }, keyHolder);
        return generatedId(keyHolder);
    }

    private Long generatedId(KeyHolder keyHolder) {
        Map<String, Object> keys = keyHolder.getKeyList().get(0);
        Object id = keys.getOrDefault("id", keys.get("ID"));
        return ((Number) id).longValue();
    }

    private Map<String, Object> transaction(Long id) {
        return jdbcTemplate.queryForMap("""
                SELECT category_id, tag, is_classified, applied_rule_id
                FROM transactions
                WHERE id = ?
                """, id);
    }
}
