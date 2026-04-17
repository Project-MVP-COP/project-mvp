package cop.kbds.agilemvp.common.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = GlobalResponseAdviceTestController.class)
@Import(GlobalResponseAdvice.class)
class GlobalResponseAdviceTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("일반 객체 반환 시 ApiResponse로 자동 래핑되는지 확인")
    void wrapNormalObject() throws Exception {
        mockMvc.perform(get("/test/normal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("test"))
                .andExpect(jsonPath("$.message").value("요청이 성공적으로 처리되었습니다."));
    }

    @Test
    @DisplayName("ApiResponse 직접 반환 시 중복 래핑되지 않는지 확인")
    void doNotWrapApiResponse() throws Exception {
        mockMvc.perform(get("/test/api-response"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("already-wrapped"))
                .andExpect(jsonPath("$.message").value("custom-message"));
    }

    @Test
    @DisplayName("ResponseEntity 반환 시 중복 래핑되지 않는지 확인")
    void doNotWrapResponseEntity() throws Exception {
        mockMvc.perform(get("/test/response-entity"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("no-wrap")); // ApiResponse 필드가 없어야 함
    }
}
