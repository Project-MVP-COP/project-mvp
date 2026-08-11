package cop.kbds.agilemvp.insight.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.fasterxml.jackson.databind.ObjectMapper;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.insight.config.BedrockProperties;
import cop.kbds.agilemvp.insight.exception.InsightErrorCode;
import cop.kbds.agilemvp.insight.service.InsightCommand;
import cop.kbds.agilemvp.insight.service.InsightCommand.InsightTransaction;
import cop.kbds.agilemvp.insight.service.InsightResult;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.AccessDeniedException;
import software.amazon.awssdk.services.bedrockruntime.model.ContentBlock;
import software.amazon.awssdk.services.bedrockruntime.model.ConversationRole;
import software.amazon.awssdk.services.bedrockruntime.model.ConverseOutput;
import software.amazon.awssdk.services.bedrockruntime.model.ConverseRequest;
import software.amazon.awssdk.services.bedrockruntime.model.ConverseResponse;
import software.amazon.awssdk.services.bedrockruntime.model.Message;
import software.amazon.awssdk.services.bedrockruntime.model.ModelTimeoutException;

class BedrockInsightGeneratorTest {

    private static final String MODEL_ID = "apac.anthropic.claude-3-5-sonnet-20240620-v1:0";

    private BedrockRuntimeClient bedrockRuntimeClient;
    private BedrockInsightGenerator generator;

    @BeforeEach
    void setUp() {
        bedrockRuntimeClient = mock(BedrockRuntimeClient.class);
        ObjectMapper objectMapper = new ObjectMapper();
        BedrockProperties properties = new BedrockProperties(
                true,
                "ap-northeast-2",
                MODEL_ID,
                1200,
                0.2f,
                Duration.ofSeconds(30));
        generator = new BedrockInsightGenerator(
                bedrockRuntimeClient,
                properties,
                new InsightPromptFactory(objectMapper),
                objectMapper);
    }

    @Test
    @DisplayName("거래 조건을 Converse 요청으로 보내고 기존 응답 스키마로 변환한다")
    void generate_MapsBedrockResponse() {
        given(bedrockRuntimeClient.converse(any(ConverseRequest.class)))
                .willReturn(response("""
                        {"summary":" 식비 비중이 높습니다. ","cards":[
                          {"title":" 식비 집중 ","description":" 식비가 가장 큰 지출입니다. "},
                          {"title":" 반복 결제 ","description":" 동일 가맹점 결제가 반복됩니다. "},
                          {"title":" 점검 제안 ","description":" 소액 결제를 확인해보세요. "}
                        ]}
                        """));

        InsightResult result = generator.generate(command());

        assertThat(result.summary()).isEqualTo("식비 비중이 높습니다.");
        assertThat(result.cards()).hasSize(3);
        assertThat(result.cards().get(0).title()).isEqualTo("식비 집중");
        assertThat(result.generatedAt()).isNotBlank();

        ArgumentCaptor<ConverseRequest> captor = ArgumentCaptor.forClass(ConverseRequest.class);
        verify(bedrockRuntimeClient).converse(captor.capture());
        ConverseRequest request = captor.getValue();
        assertThat(request.modelId()).isEqualTo(MODEL_ID);
        assertThat(request.messages()).hasSize(1);
        assertThat(request.messages().get(0).content().get(0).text())
                .contains("LAST_1_MONTH", "테스트 가맹점", "12000");
        assertThat(request.inferenceConfig().maxTokens()).isEqualTo(1200);
        assertThat(request.inferenceConfig().temperature()).isEqualTo(0.2f);
    }

    @Test
    @DisplayName("JSON 코드 펜스로 감싼 모델 응답도 처리한다")
    void generate_AcceptsJsonCodeFence() {
        given(bedrockRuntimeClient.converse(any(ConverseRequest.class)))
                .willReturn(response("""
                        ```json
                        {"summary":"소비 요약","cards":[
                          {"title":"카드 1","description":"설명 1"},
                          {"title":"카드 2","description":"설명 2"}
                        ]}
                        ```
                        """));

        InsightResult result = generator.generate(command());

        assertThat(result.summary()).isEqualTo("소비 요약");
        assertThat(result.cards()).hasSize(2);
    }

    @Test
    @DisplayName("모델 응답이 기존 스키마와 다르면 502 오류로 변환한다")
    void generate_InvalidPayload_ThrowsInvalidModelResponse() {
        given(bedrockRuntimeClient.converse(any(ConverseRequest.class)))
                .willReturn(response("{\"summary\":\"요약\",\"cards\":[]}"));

        assertThatThrownBy(() -> generator.generate(command()))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode())
                                .isEqualTo(InsightErrorCode.INVALID_MODEL_RESPONSE));
    }

    @Test
    @DisplayName("Bedrock 모델 타임아웃은 504 오류로 변환한다")
    void generate_ModelTimeout_ThrowsGenerationTimeout() {
        given(bedrockRuntimeClient.converse(any(ConverseRequest.class)))
                .willThrow(ModelTimeoutException.builder().message("timed out").build());

        assertThatThrownBy(() -> generator.generate(command()))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode())
                                .isEqualTo(InsightErrorCode.GENERATION_TIMEOUT));
    }

    @Test
    @DisplayName("Bedrock 권한 오류는 503 오류로 변환한다")
    void generate_AccessDenied_ThrowsServiceUnavailable() {
        given(bedrockRuntimeClient.converse(any(ConverseRequest.class)))
                .willThrow(AccessDeniedException.builder().message("denied").build());

        assertThatThrownBy(() -> generator.generate(command()))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode())
                                .isEqualTo(InsightErrorCode.SERVICE_UNAVAILABLE));
    }

    private ConverseResponse response(String text) {
        Message message = Message.builder()
                .role(ConversationRole.ASSISTANT)
                .content(ContentBlock.fromText(text))
                .build();
        return ConverseResponse.builder()
                .output(ConverseOutput.builder().message(message).build())
                .build();
    }

    private InsightCommand command() {
        return new InsightCommand(
                "LAST_1_MONTH",
                1L,
                List.of(new InsightTransaction(
                        "2026-08-01",
                        "테스트 가맹점",
                        1L,
                        "식비",
                        12000L,
                        "점심",
                        "APPROVED",
                        true)));
    }
}
