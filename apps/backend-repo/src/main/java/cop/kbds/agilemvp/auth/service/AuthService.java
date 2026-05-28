package cop.kbds.agilemvp.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.auth.controller.AuthResponse;
import cop.kbds.agilemvp.auth.controller.LoginRequest;
import cop.kbds.agilemvp.auth.controller.RegisterRequest;
import cop.kbds.agilemvp.auth.exception.AuthErrorCode;
import cop.kbds.agilemvp.user.service.User;
import cop.kbds.agilemvp.user.service.UserService;
import lombok.RequiredArgsConstructor;

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

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(AuthErrorCode.INVALID_PASSWORD);
        }

        // 로그인 시각 업데이트
        userService.updateLastLogin(user.getLoginId());

        String token = jwtProvider.generateToken(user.getLoginId());
        return new AuthResponse(token, user.getNickname());
    }
}
