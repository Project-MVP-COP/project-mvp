package cop.kbds.agilemvp.monthlygoal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.transaction.annotation.Transactional;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.monthlygoal.exception.MonthlyGoalErrorCode;

@SpringBootTest
@Transactional
class MonthlyGoalServiceIntegrationTest {

    @Autowired
    private MonthlyGoalService monthlyGoalService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("유지 중 목표를 완수하면 확정 절감액이 조회 결과에 유지된다")
    void updateStatus_ActiveToCompleted_PersistsActualSaved() {
        Long userId = createUser("goal-complete-owner", "완수사용자");
        MonthlyGoal goal = monthlyGoalService.upsert(
                userId, YearMonth.of(2026, 8), "완수할 목표", "식음료",
                new BigDecimal("0.3"), 100_000L, 30_000L);

        MonthlyGoal updated = monthlyGoalService.updateStatus(
                userId, goal.getId(), MonthlyGoalStatus.COMPLETED, 32_000L);
        List<MonthlyGoal> goals = monthlyGoalService.findAll(userId, null);

        assertThat(updated.getStatus()).isEqualTo(MonthlyGoalStatus.COMPLETED);
        assertThat(updated.getActualSaved()).isEqualTo(32_000L);
        assertThat(goals).singleElement()
                .satisfies(saved -> {
                    assertThat(saved.getStatus()).isEqualTo(MonthlyGoalStatus.COMPLETED);
                    assertThat(saved.getActualSaved()).isEqualTo(32_000L);
                });
    }

    @Test
    @DisplayName("확정 절감액 없이 완수하면 월 절감액을 저장한다")
    void updateStatus_CompletedWithoutActualSaved_UsesMonthlySave() {
        Long userId = createUser("goal-default-save", "기본확정액사용자");
        MonthlyGoal goal = monthlyGoalService.upsert(
                userId, YearMonth.of(2026, 8), "기본 확정액 목표", "생활",
                new BigDecimal("0.2"), 100_000L, 20_000L);

        MonthlyGoal updated = monthlyGoalService.updateStatus(
                userId, goal.getId(), MonthlyGoalStatus.COMPLETED, null);

        assertThat(updated.getActualSaved()).isEqualTo(20_000L);
    }

    @Test
    @DisplayName("중단 목표는 다시 유지 중으로 변경할 수 있다")
    void updateStatus_StoppedToActive_Succeeds() {
        Long userId = createUser("goal-resume-owner", "재개사용자");
        MonthlyGoal goal = monthlyGoalService.upsert(
                userId, YearMonth.of(2026, 8), "재개할 목표", "생활",
                new BigDecimal("0.2"), 100_000L, 20_000L);
        monthlyGoalService.updateStatus(userId, goal.getId(), MonthlyGoalStatus.STOPPED, null);

        MonthlyGoal resumed = monthlyGoalService.updateStatus(
                userId, goal.getId(), MonthlyGoalStatus.ACTIVE, null);

        assertThat(resumed.getStatus()).isEqualTo(MonthlyGoalStatus.ACTIVE);
        assertThat(resumed.getActualSaved()).isNull();
    }

    @Test
    @DisplayName("완수 목표의 추가 상태 변경은 거절하고 기존 상태를 유지한다")
    void updateStatus_CompletedGoal_RejectsTransition() {
        Long userId = createUser("goal-immutable-owner", "완수불변사용자");
        MonthlyGoal goal = monthlyGoalService.upsert(
                userId, YearMonth.of(2026, 8), "불변 목표", "식음료",
                new BigDecimal("0.3"), 100_000L, 30_000L);
        monthlyGoalService.updateStatus(userId, goal.getId(), MonthlyGoalStatus.COMPLETED, 31_000L);

        assertThatThrownBy(() -> monthlyGoalService.updateStatus(
                userId, goal.getId(), MonthlyGoalStatus.STOPPED, null))
                .isInstanceOf(BusinessException.class)
                .extracting(exception -> ((BusinessException) exception).getErrorCode())
                .isEqualTo(MonthlyGoalErrorCode.INVALID_STATUS_TRANSITION);

        MonthlyGoal saved = monthlyGoalService.findAll(userId, null).getFirst();
        assertThat(saved.getStatus()).isEqualTo(MonthlyGoalStatus.COMPLETED);
        assertThat(saved.getActualSaved()).isEqualTo(31_000L);
    }

    @Test
    @DisplayName("다른 사용자의 목표 상태는 변경할 수 없다")
    void updateStatus_OtherUsersGoal_ReturnsNotFound() {
        Long ownerId = createUser("goal-real-owner", "실제소유자");
        Long requesterId = createUser("goal-wrong-owner", "다른요청자");
        MonthlyGoal goal = monthlyGoalService.upsert(
                ownerId, YearMonth.of(2026, 8), "소유자 목표", "생활",
                new BigDecimal("0.2"), 100_000L, 20_000L);

        assertThatThrownBy(() -> monthlyGoalService.updateStatus(
                requesterId, goal.getId(), MonthlyGoalStatus.STOPPED, null))
                .isInstanceOf(BusinessException.class)
                .extracting(exception -> ((BusinessException) exception).getErrorCode())
                .isEqualTo(MonthlyGoalErrorCode.GOAL_NOT_FOUND);
    }

    @Test
    @DisplayName("사용자의 모든 상태 목표를 연월 오름차순으로 조회한다")
    void findAll_ReturnsOnlyUsersGoalsInMonthOrder() {
        Long userId = createUser("goal-list-owner", "목록사용자");
        Long otherUserId = createUser("goal-list-other", "다른목록사용자");

        monthlyGoalService.upsert(
                userId, YearMonth.of(2026, 8), "8월 목표", "생활",
                new BigDecimal("0.2"), 100_000L, 20_000L);
        MonthlyGoal juneGoal = monthlyGoalService.upsert(
                userId, YearMonth.of(2026, 6), "6월 목표", "식음료",
                new BigDecimal("0.3"), 100_000L, 30_000L);
        monthlyGoalService.upsert(
                otherUserId, YearMonth.of(2026, 7), "다른 사용자 목표", "교통",
                new BigDecimal("0.1"), 100_000L, 10_000L);

        jdbcTemplate.update(
                "UPDATE monthly_goals SET status = 'completed', actual_saved = 32000 WHERE id = ?",
                juneGoal.getId());

        List<MonthlyGoal> goals = monthlyGoalService.findAll(userId, null);

        assertThat(goals).hasSize(2);
        assertThat(goals)
                .extracting(MonthlyGoal::getGoalMonth)
                .containsExactly(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 8, 1));
        assertThat(goals)
                .extracting(MonthlyGoal::getStatus)
                .containsExactly(MonthlyGoalStatus.COMPLETED, MonthlyGoalStatus.ACTIVE);
        assertThat(goals).allMatch(goal -> goal.getUserId().equals(userId));
    }

    @Test
    @DisplayName("상태를 지정하면 해당 상태의 목표만 조회한다")
    void findAll_StatusFilter_ReturnsMatchingGoals() {
        Long userId = createUser("goal-status-owner", "상태목록사용자");
        MonthlyGoal completed = monthlyGoalService.upsert(
                userId, YearMonth.of(2026, 6), "완수 목표", "식음료",
                new BigDecimal("0.3"), 100_000L, 30_000L);
        monthlyGoalService.upsert(
                userId, YearMonth.of(2026, 7), "유지 목표", "생활",
                new BigDecimal("0.2"), 100_000L, 20_000L);

        jdbcTemplate.update(
                "UPDATE monthly_goals SET status = 'completed', actual_saved = 31000 WHERE id = ?",
                completed.getId());

        List<MonthlyGoal> goals = monthlyGoalService.findAll(userId, MonthlyGoalStatus.COMPLETED);

        assertThat(goals).singleElement()
                .satisfies(goal -> {
                    assertThat(goal.getId()).isEqualTo(completed.getId());
                    assertThat(goal.getActualSaved()).isEqualTo(31_000L);
                });
    }

    @Test
    @DisplayName("개발용 테스트 사용자에게 이전 월 예시 목표가 제공된다")
    void devSeed_ContainsHistoricalGoals() {
        Long userId = jdbcTemplate.queryForObject(
                "SELECT id FROM users WHERE login_id = 'testuser'",
                Long.class);

        List<MonthlyGoal> goals = monthlyGoalService.findAll(userId, null);

        assertThat(goals).hasSize(2);
        assertThat(goals)
                .extracting(MonthlyGoal::getStatus)
                .containsExactly(MonthlyGoalStatus.COMPLETED, MonthlyGoalStatus.ACTIVE);
        assertThat(goals)
                .extracting(MonthlyGoal::getGoalMonth)
                .allMatch(month -> month.isBefore(LocalDate.now().withDayOfMonth(1)));
    }

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
