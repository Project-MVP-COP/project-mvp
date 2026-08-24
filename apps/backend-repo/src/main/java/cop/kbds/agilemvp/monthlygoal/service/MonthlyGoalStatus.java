package cop.kbds.agilemvp.monthlygoal.service;

import java.util.Arrays;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.monthlygoal.exception.MonthlyGoalErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MonthlyGoalStatus {
    ACTIVE("active"),
    COMPLETED("completed"),
    STOPPED("stopped");

    private final String value;

    public boolean canTransitionTo(MonthlyGoalStatus target) {
        return switch (this) {
            case ACTIVE -> target == COMPLETED || target == STOPPED;
            case STOPPED -> target == ACTIVE;
            case COMPLETED -> false;
        };
    }

    public static MonthlyGoalStatus from(String value) {
        return Arrays.stream(values())
                .filter(status -> status.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new BusinessException(MonthlyGoalErrorCode.INVALID_STATUS));
    }
}
