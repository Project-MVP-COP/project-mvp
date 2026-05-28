package cop.kbds.agilemvp.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.auth.controller.AuthResponse;
import cop.kbds.agilemvp.auth.controller.LoginRequest;
import cop.kbds.agilemvp.auth.controller.RegisterRequest;
import cop.kbds.agilemvp.auth.exception.AuthErrorCode;
import cop.kbds.agilemvp.user.service.User;
import cop.kbds.agilemvp.user.service.UserService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtProvider jwtProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("회원가입 요청 시 비밀번호를 암호화하여 회원 생성 서비스를 호출한다")
    void register_Success() {
        // given
        RegisterRequest request = new RegisterRequest("joinuser", "조인유저", "password123!");
        given(passwordEncoder.encode("password123!")).willReturn("encrypted-password-hash");

        // when
        authService.register(request);

        // then
        verify(passwordEncoder).encode("password123!");
        verify(userService).createUser("joinuser", "조인유저", "encrypted-password-hash");
    }

    @Test
    @DisplayName("로그인 요청 시 비밀번호가 일치하면 JWT 토큰과 닉네임을 반환한다")
    void login_Success() {
        // given
        LoginRequest request = new LoginRequest("testuser", "password123!");
        User user = new User(1L, "testuser", "테스터", "encrypted-password-hash", "active", null, null, null);

        given(userService.getUserByLoginId("testuser")).willReturn(user);
        given(passwordEncoder.matches("password123!", "encrypted-password-hash")).willReturn(true);
        given(jwtProvider.generateToken("testuser")).willReturn("mocked-jwt-token");

        // when
        AuthResponse response = authService.login(request);

        // then
        assertThat(response.accessToken()).isEqualTo("mocked-jwt-token");
        assertThat(response.nickname()).isEqualTo("테스터");
    }

    @Test
    @DisplayName("로그인 요청 시 비밀번호가 틀리면 예외(INVALID_PASSWORD)가 발생한다")
    void login_InvalidPassword_Fail() {
        // given
        LoginRequest request = new LoginRequest("testuser", "wrong-password");
        User user = new User(1L, "testuser", "테스터", "encrypted-password-hash", "active", null, null, null);

        given(userService.getUserByLoginId("testuser")).willReturn(user);
        given(passwordEncoder.matches("wrong-password", "encrypted-password-hash")).willReturn(false);

        // when & then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(AuthErrorCode.INVALID_PASSWORD.getMessage());
    }
}
