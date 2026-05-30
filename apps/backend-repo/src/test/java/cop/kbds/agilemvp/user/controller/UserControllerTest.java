package cop.kbds.agilemvp.user.controller;

import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import cop.kbds.agilemvp.common.exception.GlobalExceptionHandler;
import cop.kbds.agilemvp.auth.config.SecurityConfig;
import cop.kbds.agilemvp.auth.service.JwtProvider;
import cop.kbds.agilemvp.user.service.User;
import cop.kbds.agilemvp.user.service.UserService;

@WebMvcTest(controllers = UserController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtProvider jwtProvider; // SecurityConfig 구동용 Mocking

    @Test
    @DisplayName("로그인된 사용자 본인의 상세 정보를 성공적으로 조회한다")
    void getMyInfo_Success() throws Exception {
        User customPrincipal = new User(1L, "testuser", "테스터", "hashed-password", "active", null, null, null);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                customPrincipal, null, Collections.emptyList());

        mockMvc.perform(get("/api/user/me")
                .with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loginId").value("testuser"))
                .andExpect(jsonPath("$.nickname").value("테스터"))
                .andExpect(jsonPath("$.status").value("active"));
    }

    @Test
    @DisplayName("로그인된 사용자 본인의 계정을 소프트 삭제(탈퇴)한다")
    void deleteMe_Success() throws Exception {
        User customPrincipal = new User(1L, "testuser", "테스터", "hashed-password", "active", null, null, null);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                customPrincipal, null, Collections.emptyList());
        
        doNothing().when(userService).deleteUser("testuser");

        mockMvc.perform(delete("/api/user")
                .with(csrf())
                .with(authentication(auth)))
                .andExpect(status().isNoContent());
    }
}
