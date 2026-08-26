package cop.kbds.agilemvp.monthlygoal.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.YearMonth;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class MonthlyGoalServiceIntegrationTest {

    @Autowired
    private MonthlyGoalService monthlyGoalService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("같은 사용자의 같은 월 목표를 다시 저장하면 기존 목표를 교체한다")
    void upsert_SameUserAndMonth_ReplacesExistingGoal() {
        Long userId = createUser("goal-owner", "목표사용자");
        YearMonth month = YearMonth.of(2026, 8);

        MonthlyGoal first = monthlyGoalService.upsert(
                userId,
                month,
                "식비 30% 줄이기",
                "식음료",
                new BigDecimal("0.3"),
                100_000L,
                30_000L);

        jdbcTemplate.update(
                "UPDATE monthly_goals SET status = 'completed', actual_saved = 32000 WHERE id = ?",
                first.getId());

        MonthlyGoal replaced = monthlyGoalService.upsert(
                userId,
                month,
                "생활비 40% 줄이기",
                "생활",
                new BigDecimal("0.4"),
                120_000L,
                48_000L);

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM monthly_goals WHERE user_id = ? AND goal_month = CAST(? AS DATE)",
                Integer.class,
                userId,
                "2026-08-01");

        assertThat(count).isEqualTo(1);
        assertThat(replaced.getId()).isEqualTo(first.getId());
        assertThat(replaced.getTitle()).isEqualTo("생활비 40% 줄이기");
        assertThat(replaced.getTargetCategory()).isEqualTo("생활");
        assertThat(replaced.getMonthlySave()).isEqualTo(48_000L);
        assertThat(replaced.getStatus()).isEqualTo(MonthlyGoalStatus.ACTIVE);
        assertThat(replaced.getActualSaved()).isNull();
    }

    @Test
    @DisplayName("서로 다른 사용자는 같은 월에 각자의 목표를 저장할 수 있다")
    void upsert_DifferentUsersAndSameMonth_KeepsUserScope() {
        Long firstUserId = createUser("goal-user-a", "목표사용자A");
        Long secondUserId = createUser("goal-user-b", "목표사용자B");
        YearMonth month = YearMonth.of(2026, 8);

        MonthlyGoal first = monthlyGoalService.upsert(
                firstUserId, month, "식비 줄이기", "식음료",
                new BigDecimal("0.3"), 100_000L, 30_000L);
        MonthlyGoal second = monthlyGoalService.upsert(
                secondUserId, month, "생활비 줄이기", "생활",
                new BigDecimal("0.4"), 100_000L, 40_000L);

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM monthly_goals WHERE goal_month = CAST(? AS DATE)",
                Integer.class,
                "2026-08-01");

        assertThat(count).isEqualTo(2);
        assertThat(first.getId()).isNotEqualTo(second.getId());
        assertThat(first.getUserId()).isEqualTo(firstUserId);
        assertThat(second.getUserId()).isEqualTo(secondUserId);
    }

    private Long createUser(String loginId, String nickname) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    INSERT INTO users (login_id, nickname, password_hash)
                    VALUES (?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, loginId);
            statement.setString(2, nickname);
            statement.setString(3, "{noop}password");
            return statement;
        }, keyHolder);
        Map<String, Object> keys = keyHolder.getKeyList().getFirst();
        Object key = keys.getOrDefault("id", keys.get("ID"));
        if (!(key instanceof Number number)) {
            throw new IllegalStateException("테스트 사용자 키 생성에 실패했습니다.");
        }
        return number.longValue();
    }
}
