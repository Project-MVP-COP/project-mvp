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
            "월 목표 저장 결과를 확인할 수 없습니다."),
    INVALID_STATUS(
            HttpStatus.BAD_REQUEST,
            "MGO005",
            "목표 상태는 active, completed, stopped 중 하나여야 합니다."),
    GOAL_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "MGO006",
            "월 목표를 찾을 수 없습니다."),
    INVALID_STATUS_TRANSITION(
            HttpStatus.CONFLICT,
            "MGO007",
            "허용되지 않은 목표 상태 변경입니다."),
    INVALID_ACTUAL_SAVED(
            HttpStatus.BAD_REQUEST,
            "MGO008",
            "확정 절감액은 완수 처리할 때만 0 이상으로 입력할 수 있습니다."),
    UPDATE_FAILED(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "MGO009",
            "월 목표 상태 변경 결과를 확인할 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() {
        return name();
    }
}
