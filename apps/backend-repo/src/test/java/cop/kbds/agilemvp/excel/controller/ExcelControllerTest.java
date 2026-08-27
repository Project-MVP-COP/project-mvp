package cop.kbds.agilemvp.excel.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
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
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.mock.web.MockMultipartFile;

import cop.kbds.agilemvp.auth.config.SecurityConfig;
import cop.kbds.agilemvp.auth.service.JwtProvider;
import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.common.exception.CommonErrorCode;
import cop.kbds.agilemvp.common.exception.GlobalExceptionHandler;
import cop.kbds.agilemvp.excel.service.ExcelService;
import cop.kbds.agilemvp.transaction.controller.TransactionDto;
import cop.kbds.agilemvp.user.service.User;
import cop.kbds.agilemvp.user.service.UserService;

@WebMvcTest(controllers = ExcelController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class})
class ExcelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExcelService excelService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("인증된 multipart 엑셀 업로드는 파싱 결과를 반환한다")
    void uploadExcel_Success() throws Exception {
        MockMultipartFile file = excelFile();
        TransactionDto transaction = TransactionDto.builder()
                .id(1L)
                .userId(1L)
                .transactionDate("2026-08-01")
                .merchant("스타벅스")
                .amount(6_500L)
                .cardName("신한카드")
                .installment(1)
                .status("승인")
                .isClassified(false)
                .build();
        given(excelService.parseUpload(any(), eq(1L)))
                .willReturn(List.of(transaction));

        mockMvc.perform(uploadRequest(file).with(authentication(authenticatedUser())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].merchant").value("스타벅스"))
                .andExpect(jsonPath("$[0].amount").value(6500));

        verify(excelService).parseUpload(file, 1L);
    }

    @Test
    @DisplayName("엑셀 파싱 오류는 ProblemDetail 400으로 반환한다")
    void uploadExcel_InvalidFormat_ReturnsBadRequest() throws Exception {
        given(excelService.parseUpload(any(), eq(1L)))
                .willThrow(new BusinessException(CommonErrorCode.INVALID_INPUT, "지원하지 않는 엑셀 형식입니다."));

        mockMvc.perform(uploadRequest(excelFile()).with(authentication(authenticatedUser())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("INVALID_INPUT"))
                .andExpect(jsonPath("$.detail").value("지원하지 않는 엑셀 형식입니다."))
                .andExpect(jsonPath("$.traceId").exists());
    }

    @Test
    @DisplayName("인증하지 않은 엑셀 업로드 요청은 403을 반환한다")
    void uploadExcel_Unauthenticated_ReturnsForbidden() throws Exception {
        mockMvc.perform(uploadRequest(excelFile()))
                .andExpect(status().isForbidden());
    }

    private MockMultipartHttpServletRequestBuilder uploadRequest(MockMultipartFile file) {
        return multipart("/api/excel/upload").file(file);
    }

    private MockMultipartFile excelFile() {
        return new MockMultipartFile(
                "file",
                "transactions.xlsx",
                MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").toString(),
                "xlsx-content".getBytes());
    }

    private UsernamePasswordAuthenticationToken authenticatedUser() {
        User user = new User(1L, "testuser", "테스터", "hashed-password", "active", null, null, null);
        return new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
    }
}
