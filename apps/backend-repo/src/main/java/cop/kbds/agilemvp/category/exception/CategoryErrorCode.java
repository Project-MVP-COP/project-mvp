package cop.kbds.agilemvp.category.exception;

import cop.kbds.agilemvp.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CategoryErrorCode implements ErrorCode {
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "CAT001", "카테고리를 찾을 수 없습니다."),
    DUPLICATE_CATEGORY_NAME(HttpStatus.CONFLICT, "CAT002", "이미 사용 중인 카테고리명입니다."),
    DEFAULT_CATEGORY_CANNOT_BE_DELETED(HttpStatus.FORBIDDEN, "CAT003", "기본 카테고리는 삭제할 수 없습니다."),
    DEFAULT_CATEGORY_CANNOT_BE_MODIFIED(HttpStatus.FORBIDDEN, "CAT004", "기본 카테고리는 수정할 수 없습니다."),
    CATEGORY_IN_USE(HttpStatus.CONFLICT, "CAT005", "사용 중인 카테고리는 삭제할 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() { return this.name(); }
}
