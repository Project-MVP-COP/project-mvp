package cop.kbds.agilemvp.insight.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import cop.kbds.agilemvp.auth.config.SecurityConfig;
import cop.kbds.agilemvp.auth.service.JwtProvider;
import cop.kbds.agilemvp.common.exception.GlobalExceptionHandler;
import cop.kbds.agilemvp.insight.service.InsightResult;
import cop.kbds.agilemvp.insight.service.InsightResult.InsightCard;
import cop.kbds.agilemvp.insight.service.InsightCommand;
import cop.kbds.agilemvp.insight.service.InsightService;
import cop.kbds.agilemvp.user.service.User;
import cop.kbds.agilemvp.user.service.UserService;

@WebMvcTest(controllers = InsightController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class})
class InsightControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private InsightService insightService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("정상 요청은 하드코딩된 요약과 핵심 포인트를 반환한다")
    void generate_Success() throws Exception {
        InsightRequest request = validRequest();
        InsightResult result = new InsightResult(
                "소비 요약",
                List.of(
                        new InsightCard("가장 큰 지출", "식비 비중이 가장 높습니다."),
                        new InsightCard("반복 지출", "반복 결제가 확인되었습니다.")
                ),
                "2026-08-06T16:30:00+09:00"
        );
        given(insightService.generate(eq(1L), any(InsightCommand.class))).willReturn(result);

        mockMvc.perform(post("/api/insights")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .authentication(authenticatedUser()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary").value("소비 요약"))
                .andExpect(jsonPath("$.cards.length()").value(2))
                .andExpect(jsonPath("$.cards[0].title").value("가장 큰 지출"))
                .andExpect(jsonPath("$.cards[0].description").value("식비 비중이 가장 높습니다."))
                .andExpect(jsonPath("$.generatedAt").value("2026-08-06T16:30:00+09:00"));
    }

    @Test
    @DisplayName("분석 기간이 누락되면 400과 표시 가능한 검증 메시지를 반환한다")
    void generate_MissingPeriod_ReturnsBadRequest() throws Exception {
        String request = """
                {
                  "categoryId": null,
                  "transactions": [{
                    "transactionDate": "2026-08-01",
                    "merchant": "테스트 가맹점",
                    "amount": 12000
                  }]
                }
                """;

        mockMvc.perform(post("/api/insights")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .authentication(authenticatedUser()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("잘못된 입력값입니다."))
                .andExpect(jsonPath("$.errors.period").value("분석 기간을 선택해주세요."));
    }

    @Test
    @DisplayName("거래 목록이 비어 있으면 400과 표시 가능한 검증 메시지를 반환한다")
    void generate_EmptyTransactions_ReturnsBadRequest() throws Exception {
        String request = """
                {
                  "period": "ALL",
                  "categoryId": null,
                  "transactions": []
                }
                """;

        mockMvc.perform(post("/api/insights")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .authentication(authenticatedUser()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.transactions")
                        .value("분석할 거래 내역을 한 건 이상 입력해주세요."));
    }

    @Test
    @DisplayName("지원하지 않는 분석 기간은 400과 표시 가능한 오류 메시지를 반환한다")
    void generate_InvalidPeriod_ReturnsBadRequest() throws Exception {
        String request = """
                {
                  "period": "LAST_1_YEAR",
                  "categoryId": null,
                  "transactions": [{
                    "transactionDate": "2026-08-01",
                    "merchant": "테스트 가맹점",
                    "amount": 12000
                  }]
                }
                """;

        mockMvc.perform(post("/api/insights")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .authentication(authenticatedUser()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("읽을 수 없는 요청 메시지입니다."));
    }

    @Test
    @DisplayName("인증하지 않은 요청은 403을 반환한다")
    void generate_Unauthenticated_ReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/insights")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isForbidden());
    }

    private InsightRequest validRequest() {
        return new InsightRequest(
                InsightPeriod.LAST_1_MONTH,
                null,
                List.of(new InsightTransactionRequest(
                        "2026-08-01",
                        "테스트 가맹점",
                        null,
                        "식비",
                        12000L,
                        null,
                        "APPROVED",
                        true
                ))
        );
    }

    private UsernamePasswordAuthenticationToken authenticatedUser() {
        User user = new User(1L, "testuser", "테스터", "hashed-password", "active", null, null, null);
        return new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
    }
}
