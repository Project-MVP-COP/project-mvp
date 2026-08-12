package cop.kbds.agilemvp.insight.client;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.insight.config.BedrockProperties;
import cop.kbds.agilemvp.insight.exception.InsightErrorCode;
import cop.kbds.agilemvp.insight.service.InsightCommand;
import cop.kbds.agilemvp.insight.service.InsightGenerator;
import cop.kbds.agilemvp.insight.service.InsightResult;
import cop.kbds.agilemvp.insight.service.InsightResult.InsightCard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.exception.ApiCallTimeoutException;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.BedrockRuntimeException;
import software.amazon.awssdk.services.bedrockruntime.model.ContentBlock;
import software.amazon.awssdk.services.bedrockruntime.model.ConversationRole;
import software.amazon.awssdk.services.bedrockruntime.model.ConverseRequest;
import software.amazon.awssdk.services.bedrockruntime.model.ConverseResponse;
import software.amazon.awssdk.services.bedrockruntime.model.InferenceConfiguration;
import software.amazon.awssdk.services.bedrockruntime.model.Message;
import software.amazon.awssdk.services.bedrockruntime.model.ModelTimeoutException;
import software.amazon.awssdk.services.bedrockruntime.model.SystemContentBlock;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "bedrock", name = "enabled", havingValue = "true")
public class BedrockInsightGenerator implements InsightGenerator {

    private static final String SYSTEM_PROMPT = """
            당신은 카드 소비 내역을 분석하는 금융 인사이트 도우미입니다.
            입력 데이터에서 확인할 수 있는 사실만 사용하고 금액이나 패턴을 추측하지 마세요.
            결과는 한국어로 작성하고, 과도한 단정이나 금융상품 권유는 하지 마세요.
            반드시 아래 JSON 형식의 객체만 반환하세요. 마크다운이나 추가 설명은 포함하지 마세요.
            {"summary":"1~3문장의 요약","cards":[{"title":"짧은 제목","description":"구체적인 분석"}]}
            cards는 서로 다른 관점으로 정확히 3개를 작성하세요.
            """;
    private static final int MIN_CARD_COUNT = 2;
    private static final int MAX_CARD_COUNT = 3;

    private final BedrockRuntimeClient bedrockRuntimeClient;
    private final BedrockProperties properties;
    private final InsightPromptFactory promptFactory;
    private final ObjectMapper objectMapper;

    @Override
    public InsightResult generate(InsightCommand command) {
        try {
            ConverseResponse response = bedrockRuntimeClient.converse(createRequest(command));
            GeneratedInsight generatedInsight = parse(extractText(response));
            validate(generatedInsight);

            List<InsightCard> cards = generatedInsight.cards().stream()
                    .map(card -> new InsightCard(card.title().trim(), card.description().trim()))
                    .toList();

            return new InsightResult(
                    generatedInsight.summary().trim(),
                    cards,
                    OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        } catch (BusinessException e) {
            throw e;
        } catch (ModelTimeoutException | ApiCallTimeoutException e) {
            log.warn("Bedrock insight generation timed out: {}", e.getMessage());
            throw new BusinessException(InsightErrorCode.GENERATION_TIMEOUT);
        } catch (BedrockRuntimeException | SdkClientException e) {
            log.warn("Bedrock insight generation failed: {}", e.getMessage());
            throw new BusinessException(InsightErrorCode.SERVICE_UNAVAILABLE);
        }
    }

    private ConverseRequest createRequest(InsightCommand command) {
        Message message = Message.builder()
                .role(ConversationRole.USER)
                .content(ContentBlock.fromText(promptFactory.create(command)))
                .build();

        InferenceConfiguration inferenceConfiguration = InferenceConfiguration.builder()
                .maxTokens(properties.maxTokens())
                .temperature(properties.temperature())
                .build();

        return ConverseRequest.builder()
                .modelId(properties.modelId())
                .system(SystemContentBlock.builder().text(SYSTEM_PROMPT).build())
                .messages(message)
                .inferenceConfig(inferenceConfiguration)
                .build();
    }

    private String extractText(ConverseResponse response) {
        if (response == null || response.output() == null || response.output().message() == null) {
            throw new BusinessException(InsightErrorCode.INVALID_MODEL_RESPONSE);
        }

        String text = response.output().message().content().stream()
                .map(ContentBlock::text)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElseThrow(() -> new BusinessException(InsightErrorCode.INVALID_MODEL_RESPONSE));
        return removeOptionalCodeFence(text);
    }

    private String removeOptionalCodeFence(String text) {
        String trimmed = text.trim();
        if (!trimmed.startsWith("```")) {
            return trimmed;
        }

        int firstLineEnd = trimmed.indexOf('\n');
        int closingFence = trimmed.lastIndexOf("```");
        if (firstLineEnd < 0 || closingFence <= firstLineEnd) {
            throw new BusinessException(InsightErrorCode.INVALID_MODEL_RESPONSE);
        }
        return trimmed.substring(firstLineEnd + 1, closingFence).trim();
    }

    private GeneratedInsight parse(String text) {
        try {
            return objectMapper.readValue(text, GeneratedInsight.class);
        } catch (JsonProcessingException e) {
            log.warn("Bedrock returned an invalid insight payload: {}", e.getOriginalMessage());
            throw new BusinessException(InsightErrorCode.INVALID_MODEL_RESPONSE);
        }
    }

    private void validate(GeneratedInsight insight) {
        if (insight == null || isBlank(insight.summary()) || insight.cards() == null
                || insight.cards().size() < MIN_CARD_COUNT || insight.cards().size() > MAX_CARD_COUNT
                || insight.cards().stream().anyMatch(card -> card == null
                        || isBlank(card.title()) || isBlank(card.description()))) {
            throw new BusinessException(InsightErrorCode.INVALID_MODEL_RESPONSE);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record GeneratedInsight(String summary, List<GeneratedCard> cards) {}

    private record GeneratedCard(String title, String description) {}
}
