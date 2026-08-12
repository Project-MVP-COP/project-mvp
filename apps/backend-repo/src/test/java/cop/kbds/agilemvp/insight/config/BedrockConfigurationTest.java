package cop.kbds.agilemvp.insight.config;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;

class BedrockConfigurationTest {

    private final BedrockConfiguration configuration = new BedrockConfiguration();

    @Test
    @DisplayName("유효한 설정으로 서울 리전 Bedrock 클라이언트를 생성한다")
    void bedrockRuntimeClient_ValidProperties_CreatesClient() {
        BedrockProperties properties = new BedrockProperties(
                true,
                "ap-northeast-2",
                "apac.anthropic.claude-3-5-sonnet-20240620-v1:0",
                1200,
                0.2f,
                Duration.ofSeconds(30));

        try (BedrockRuntimeClient client = configuration.bedrockRuntimeClient(properties)) {
            assertThat(client).isNotNull();
        }
    }

    @Test
    @DisplayName("Bedrock 활성화 시 모델 ID가 비어 있으면 애플리케이션 시작에 실패한다")
    void bedrockRuntimeClient_BlankModelId_FailsFast() {
        BedrockProperties properties = new BedrockProperties(
                true,
                "ap-northeast-2",
                " ",
                1200,
                0.2f,
                Duration.ofSeconds(30));

        assertThatThrownBy(() -> configuration.bedrockRuntimeClient(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("BEDROCK_MODEL_ID");
    }

    @Test
    @DisplayName("Bedrock 활성화 시 잘못된 온도 설정은 애플리케이션 시작에 실패한다")
    void bedrockRuntimeClient_InvalidTemperature_FailsFast() {
        BedrockProperties properties = new BedrockProperties(
                true,
                "ap-northeast-2",
                "model-id",
                1200,
                1.1f,
                Duration.ofSeconds(30));

        assertThatThrownBy(() -> configuration.bedrockRuntimeClient(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("BEDROCK_TEMPERATURE");
    }
}
