package cop.kbds.agilemvp.monthlygoal.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.monthlygoal.exception.MonthlyGoalErrorCode;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MonthlyGoal {

    private Long id;
    private Long userId;
    private LocalDate goalMonth;
    private String title;
    private String targetCategory;
    private BigDecimal reductionRatio;
    private Long baselineAmount;
    private Long monthlySave;
    private MonthlyGoalStatus status;
    private Long actualSaved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MonthlyGoal create(
            Long userId,
            LocalDate goalMonth,
            String title,
            String targetCategory,
            BigDecimal reductionRatio,
            Long baselineAmount,
            Long monthlySave) {
        validate(userId, goalMonth, title, targetCategory, reductionRatio, baselineAmount, monthlySave);
        return new MonthlyGoal(
                userId,
                goalMonth,
                title.trim(),
                targetCategory.trim(),
                reductionRatio,
                baselineAmount,
                monthlySave);
    }

    private MonthlyGoal(
            Long userId,
            LocalDate goalMonth,
            String title,
            String targetCategory,
            BigDecimal reductionRatio,
            Long baselineAmount,
            Long monthlySave) {
        this.userId = userId;
        this.goalMonth = goalMonth;
        this.title = title;
        this.targetCategory = targetCategory;
        this.reductionRatio = reductionRatio;
        this.baselineAmount = baselineAmount;
        this.monthlySave = monthlySave;
        this.status = MonthlyGoalStatus.ACTIVE;
    }

    public MonthlyGoal(
            Long id,
            Long userId,
            LocalDate goalMonth,
            String title,
            String targetCategory,
            BigDecimal reductionRatio,
            Long baselineAmount,
            Long monthlySave,
            String status,
            Long actualSaved,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.goalMonth = goalMonth;
        this.title = title;
        this.targetCategory = targetCategory;
        this.reductionRatio = reductionRatio;
        this.baselineAmount = baselineAmount;
        this.monthlySave = monthlySave;
        this.status = MonthlyGoalStatus.from(status);
        this.actualSaved = actualSaved;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long targetAmount() {
        return baselineAmount - monthlySave;
    }

    private static void validate(
            Long userId,
            LocalDate goalMonth,
            String title,
            String targetCategory,
            BigDecimal reductionRatio,
            Long baselineAmount,
            Long monthlySave) {
        if (userId == null || goalMonth == null || goalMonth.getDayOfMonth() != 1
                || title == null || title.isBlank()
                || targetCategory == null || targetCategory.isBlank()) {
            throw new BusinessException(MonthlyGoalErrorCode.INVALID_GOAL_VALUE);
        }
        if (reductionRatio == null
                || reductionRatio.compareTo(BigDecimal.ZERO) <= 0
                || reductionRatio.compareTo(BigDecimal.ONE) > 0) {
            throw new BusinessException(MonthlyGoalErrorCode.INVALID_REDUCTION_RATIO);
        }
        if (baselineAmount == null || baselineAmount <= 0
                || monthlySave == null || monthlySave <= 0
                || monthlySave > baselineAmount) {
            throw new BusinessException(MonthlyGoalErrorCode.INVALID_GOAL_AMOUNT);
        }
    }
}
