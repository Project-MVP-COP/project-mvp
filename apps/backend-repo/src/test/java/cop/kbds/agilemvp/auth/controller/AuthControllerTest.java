package cop.kbds.agilemvp.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.common.exception.GlobalExceptionHandler;
import cop.kbds.agilemvp.auth.config.SecurityConfig;
import cop.kbds.agilemvp.auth.exception.AuthErrorCode;
import cop.kbds.agilemvp.auth.service.AuthService;
import cop.kbds.agilemvp.auth.service.JwtProvider;
import cop.kbds.agilemvp.user.exception.UserErrorCode;
import cop.kbds.agilemvp.user.service.UserService;

@WebMvcTest(controllers = AuthController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("회원가입 요청 성공 시 201 Created를 반환한다")
    void register_Success() throws Exception {
        RegisterRequest request = new RegisterRequest("testuser", "테스터", "password123!");
        doNothing().when(authService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("회원가입 요청 시 중복 아이디 에러 발생 시 400 Bad Request와 RFC 9457 오류를 반환한다")
    void register_DuplicateLoginId_Fail() throws Exception {
        RegisterRequest request = new RegisterRequest("dupuser", "테스터", "password123!");
        willThrow(new BusinessException(UserErrorCode.DUPLICATE_LOGIN_ID)).given(authService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("DUPLICATE_LOGIN_ID"))
                .andExpect(jsonPath("$.type").value("urn:cop:kbds:agilemvp:error:USR004"));
    }

    @Test
    @DisplayName("로그인 요청 성공 시 200 OK와 토큰 정보를 반환한다")
    void login_Success() throws Exception {
        LoginRequest request = new LoginRequest("testuser", "password123!");
        AuthResponse response = new AuthResponse("mocked-jwt-token", "테스터");
        given(authService.login(any(LoginRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mocked-jwt-token"))
                .andExpect(jsonPath("$.nickname").value("테스터"));
    }

    @Test
    @DisplayName("로그인 요청 시 비밀번호 에러 발생 시 401 Unauthorized와 오류 메시지를 반환한다")
    void login_InvalidPassword_Fail() throws Exception {
        LoginRequest request = new LoginRequest("testuser", "wrong-password");
        given(authService.login(any(LoginRequest.class))).willThrow(new BusinessException(AuthErrorCode.INVALID_PASSWORD));

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("INVALID_PASSWORD"))
                .andExpect(jsonPath("$.type").value("urn:cop:kbds:agilemvp:error:ATH001"));
    }
}
