package cop.kbds.agilemvp.monthlygoal.controller;

import java.math.BigDecimal;
import java.time.YearMonth;

import cop.kbds.agilemvp.common.util.DateTimeUtil;
import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoal;
import io.swagger.v3.oas.annotations.media.Schema;

public record MonthlyGoalResponse(
        Long id,
        String month,
        String title,
        String targetCategory,
        BigDecimal reductionRatio,
        Long baselineAmount,
        Long targetAmount,
        Long monthlySave,
        @Schema(allowableValues = {"active", "completed", "stopped"})
        String status,
        Long actualSaved,
        String createdAt,
        String updatedAt
) {
    public static MonthlyGoalResponse from(MonthlyGoal goal) {
        return new MonthlyGoalResponse(
                goal.getId(),
                YearMonth.from(goal.getGoalMonth()).toString(),
                goal.getTitle(),
                goal.getTargetCategory(),
                goal.getReductionRatio(),
                goal.getBaselineAmount(),
                goal.targetAmount(),
                goal.getMonthlySave(),
                goal.getStatus().getValue(),
                goal.getActualSaved(),
                DateTimeUtil.format(goal.getCreatedAt()),
                DateTimeUtil.format(goal.getUpdatedAt()));
    }
}
