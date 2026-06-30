package cop.kbds.agilemvp.rule.exception;

import cop.kbds.agilemvp.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum RuleErrorCode implements ErrorCode {
    RULE_NOT_FOUND(HttpStatus.NOT_FOUND, "RUL001", "규칙을 찾을 수 없습니다."),
    DUPLICATE_KEYWORD(HttpStatus.CONFLICT, "RUL002", "이미 등록된 키워드입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() { return this.name(); }
}
