package cop.kbds.agilemvp.monthlygoal.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record MonthlyGoalStatusUpdateRequest(
        @NotBlank(message = "변경할 목표 상태를 입력해주세요.")
        String status,

        @PositiveOrZero(message = "확정 절감액은 0 이상이어야 합니다.")
        Long actualSaved
) {
}
