package cop.kbds.agilemvp.monthlygoal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.monthlygoal.exception.MonthlyGoalErrorCode;

class MonthlyGoalTest {

    @Test
    @DisplayName("월 목표는 입력 문자열을 정리하고 목표 금액을 계산한다")
    void create_ValidValues_CreatesActiveGoal() {
        MonthlyGoal goal = MonthlyGoal.create(
                1L,
                LocalDate.of(2026, 8, 1),
                "  식비 30% 줄이기  ",
                "  식음료  ",
                new BigDecimal("0.3"),
                100_000L,
                30_000L);

        assertThat(goal.getTitle()).isEqualTo("식비 30% 줄이기");
        assertThat(goal.getTargetCategory()).isEqualTo("식음료");
        assertThat(goal.getStatus()).isEqualTo(MonthlyGoalStatus.ACTIVE);
        assertThat(goal.targetAmount()).isEqualTo(70_000L);
    }

    @Test
    @DisplayName("절감 비율이 허용 범위를 벗어나면 거절한다")
    void create_InvalidReductionRatio_ThrowsBusinessException() {
        assertThatThrownBy(() -> MonthlyGoal.create(
                1L,
                LocalDate.of(2026, 8, 1),
                "식비 줄이기",
                "식음료",
                new BigDecimal("1.1"),
                100_000L,
                30_000L))
                .isInstanceOf(BusinessException.class)
                .extracting(exception -> ((BusinessException) exception).getErrorCode())
                .isEqualTo(MonthlyGoalErrorCode.INVALID_REDUCTION_RATIO);
    }

    @Test
    @DisplayName("월 절감액이 기준 금액보다 크면 거절한다")
    void create_MonthlySaveGreaterThanBaseline_ThrowsBusinessException() {
        assertThatThrownBy(() -> MonthlyGoal.create(
                1L,
                LocalDate.of(2026, 8, 1),
                "식비 줄이기",
                "식음료",
                new BigDecimal("0.3"),
                20_000L,
                30_000L))
                .isInstanceOf(BusinessException.class)
                .extracting(exception -> ((BusinessException) exception).getErrorCode())
                .isEqualTo(MonthlyGoalErrorCode.INVALID_GOAL_AMOUNT);
    }
}
