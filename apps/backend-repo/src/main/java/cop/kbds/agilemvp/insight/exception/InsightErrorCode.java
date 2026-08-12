package cop.kbds.agilemvp.insight.exception;

import org.springframework.http.HttpStatus;

import cop.kbds.agilemvp.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InsightErrorCode implements ErrorCode {

    GENERATION_TIMEOUT(
            HttpStatus.GATEWAY_TIMEOUT,
            "INS001",
            "AI 인사이트 생성 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."),
    SERVICE_UNAVAILABLE(
            HttpStatus.SERVICE_UNAVAILABLE,
            "INS002",
            "AI 인사이트 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요."),
    INVALID_MODEL_RESPONSE(
            HttpStatus.BAD_GATEWAY,
            "INS003",
            "AI 인사이트 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() {
        return name();
    }
}
