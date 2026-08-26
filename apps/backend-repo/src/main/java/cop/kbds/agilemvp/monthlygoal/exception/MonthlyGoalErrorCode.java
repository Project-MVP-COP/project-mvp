package cop.kbds.agilemvp.monthlygoal.exception;

import org.springframework.http.HttpStatus;

import cop.kbds.agilemvp.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MonthlyGoalErrorCode implements ErrorCode {

    INVALID_GOAL_VALUE(
            HttpStatus.BAD_REQUEST,
            "MGO001",
            "월 목표 입력값이 올바르지 않습니다."),
    INVALID_REDUCTION_RATIO(
            HttpStatus.BAD_REQUEST,
            "MGO002",
            "절감 비율은 0보다 크고 1 이하여야 합니다."),
    INVALID_GOAL_AMOUNT(
            HttpStatus.BAD_REQUEST,
            "MGO003",
            "월 절감액은 0보다 크고 기준 금액 이하여야 합니다."),
    SAVE_FAILED(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "MGO004",
            "월 목표 저장 결과를 확인할 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() {
        return name();
    }
}
