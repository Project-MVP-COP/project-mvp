package com.example.demo.user.exception;

import com.example.demo.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {

    INVALID_LOGIN_ID(HttpStatus.BAD_REQUEST,   "USR001", "로그인 ID는 2자 이상이어야 합니다."),
    INVALID_NICKNAME(HttpStatus.BAD_REQUEST,   "USR002", "닉네임은 1자 이상이어야 합니다."),
    INVALID_PASSWORD_HASH(HttpStatus.BAD_REQUEST, "USR003", "비밀번호 해시값은 필수입니다."),
    DUPLICATE_LOGIN_ID(HttpStatus.BAD_REQUEST, "USR004", "이미 사용 중인 로그인 ID입니다."),
    DUPLICATE_NICKNAME(HttpStatus.BAD_REQUEST, "USR005", "이미 사용 중인 닉네임입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND,       "USR006", "존재하지 않는 사용자입니다."),
    USER_NOT_ACTIVE(HttpStatus.UNAUTHORIZED,   "USR007", "비활성화된 계정입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() { return this.name(); }
}
