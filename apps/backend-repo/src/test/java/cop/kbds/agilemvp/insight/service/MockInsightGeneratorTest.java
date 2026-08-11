package cop.kbds.agilemvp.insight.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import cop.kbds.agilemvp.insight.service.InsightCommand.InsightTransaction;

class MockInsightGeneratorTest {

    private final MockInsightGenerator generator = new MockInsightGenerator();

    @Test
    @DisplayName("Bedrock 비활성 시 기존 요약과 세 개의 카드를 반환한다")
    void generate_ReturnsMockInsight() {
        InsightCommand command = new InsightCommand(
                "ALL",
                null,
                List.of(new InsightTransaction(
                        "2026-08-01", "테스트 가맹점", null, "식비",
                        12000L, null, "APPROVED", true)));

        InsightResult result = generator.generate(command);

        assertThat(result.summary()).isNotBlank();
        assertThat(result.cards()).hasSize(3);
        assertThat(result.cards()).allSatisfy(card -> {
            assertThat(card.title()).isNotBlank();
            assertThat(card.description()).isNotBlank();
        });
        assertThatCode(() -> OffsetDateTime.parse(result.generatedAt()))
                .doesNotThrowAnyException();
    }
}
