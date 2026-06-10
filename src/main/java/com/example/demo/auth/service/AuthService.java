package com.example.demo.auth.service;

import com.example.demo.auth.controller.AuthResponse;
import com.example.demo.auth.controller.LoginRequest;
import com.example.demo.auth.controller.RegisterRequest;
import com.example.demo.auth.exception.AuthErrorCode;
import com.example.demo.common.exception.BusinessException;
import com.example.demo.user.service.User;
import com.example.demo.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public void register(RegisterRequest request) {
        String passwordHash = passwordEncoder.encode(request.password());
        userService.createUser(request.loginId(), request.nickname(), passwordHash);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userService.getUserByLoginId(request.loginId());

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash()))
            throw new BusinessException(AuthErrorCode.INVALID_PASSWORD);

        userService.updateLastLogin(user.getLoginId());

        String token = jwtProvider.generateToken(user.getLoginId());
        return new AuthResponse(token, user.getNickname());
    }
}
