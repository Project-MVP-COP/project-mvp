package com.example.demo.auth.exception;

import com.example.demo.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum AuthErrorCode implements ErrorCode {

    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "ATH001", "잘못된 비밀번호입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED,     "ATH002", "로그인이 필요하거나 권한이 없습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED,    "ATH003", "유효하지 않거나 만료된 토큰입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() { return this.name(); }
}
