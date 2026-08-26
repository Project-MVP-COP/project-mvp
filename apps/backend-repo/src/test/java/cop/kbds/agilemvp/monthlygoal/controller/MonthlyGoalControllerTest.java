package cop.kbds.agilemvp.monthlygoal.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Collections;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import cop.kbds.agilemvp.auth.config.SecurityConfig;
import cop.kbds.agilemvp.auth.service.JwtProvider;
import cop.kbds.agilemvp.common.exception.GlobalExceptionHandler;
import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoal;
import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoalService;
import cop.kbds.agilemvp.user.service.User;
import cop.kbds.agilemvp.user.service.UserService;

@WebMvcTest(controllers = MonthlyGoalController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class})
class MonthlyGoalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MonthlyGoalService monthlyGoalService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("월 목표 저장 성공 시 갱신된 목표를 반환한다")
    void upsert_Success_ReturnsSavedGoal() throws Exception {
        given(monthlyGoalService.upsert(
                anyLong(),
                any(YearMonth.class),
                anyString(),
                anyString(),
                any(BigDecimal.class),
                anyLong(),
                anyLong()))
                .willReturn(savedGoal());

        mockMvc.perform(put("/api/monthly-goals/2026-08")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .authentication(authenticatedUser()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.month").value("2026-08"))
                .andExpect(jsonPath("$.title").value("식비 30% 줄이기"))
                .andExpect(jsonPath("$.targetCategory").value("식음료"))
                .andExpect(jsonPath("$.reductionRatio").value(0.3))
                .andExpect(jsonPath("$.baselineAmount").value(100000))
                .andExpect(jsonPath("$.targetAmount").value(70000))
                .andExpect(jsonPath("$.monthlySave").value(30000))
                .andExpect(jsonPath("$.status").value("active"))
                .andExpect(jsonPath("$.actualSaved").doesNotExist());
    }

    @Test
    @DisplayName("월 절감액이 0이면 필드 검증 오류를 반환한다")
    void upsert_ZeroMonthlySave_ReturnsBadRequest() throws Exception {
        String request = """
                {
                  "title": "식비 30% 줄이기",
                  "targetCategory": "식음료",
                  "reductionRatio": 0.3,
                  "baselineAmount": 100000,
                  "monthlySave": 0
                }
                """;

        mockMvc.perform(put("/api/monthly-goals/2026-08")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .authentication(authenticatedUser()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.monthlySave")
                        .value("월 절감액은 0보다 커야 합니다."));
    }

    @Test
    @DisplayName("연월 형식이 올바르지 않으면 400을 반환한다")
    void upsert_InvalidMonth_ReturnsBadRequest() throws Exception {
        mockMvc.perform(put("/api/monthly-goals/2026-13")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .authentication(authenticatedUser()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("INVALID_TYPE_VALUE"));
    }

    @Test
    @DisplayName("인증하지 않은 월 목표 저장 요청은 403을 반환한다")
    void upsert_Unauthenticated_ReturnsForbidden() throws Exception {
        mockMvc.perform(put("/api/monthly-goals/2026-08")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest()))
                .andExpect(status().isForbidden());
    }

    private MonthlyGoal savedGoal() {
        return new MonthlyGoal(
                10L,
                1L,
                LocalDate.of(2026, 8, 1),
                "식비 30% 줄이기",
                "식음료",
                new BigDecimal("0.3000"),
                100_000L,
                30_000L,
                "active",
                null,
                LocalDateTime.of(2026, 8, 24, 10, 0),
                LocalDateTime.of(2026, 8, 24, 10, 0));
    }

    private String validRequest() {
        return """
                {
                  "title": "식비 30% 줄이기",
                  "targetCategory": "식음료",
                  "reductionRatio": 0.3,
                  "baselineAmount": 100000,
                  "monthlySave": 30000
                }
                """;
    }

    private UsernamePasswordAuthenticationToken authenticatedUser() {
        User user = new User(1L, "testuser", "테스터", "hashed-password", "active", null, null, null);
        return new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
    }
}
