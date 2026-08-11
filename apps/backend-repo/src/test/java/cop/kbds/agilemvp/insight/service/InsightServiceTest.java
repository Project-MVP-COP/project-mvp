package cop.kbds.agilemvp.insight.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import cop.kbds.agilemvp.insight.service.InsightCommand.InsightTransaction;
import cop.kbds.agilemvp.insight.service.InsightResult.InsightCard;

class InsightServiceTest {

    @Test
    @DisplayName("인사이트 생성을 활성화된 생성 전략에 위임한다")
    void generate_DelegatesToGenerator() {
        InsightGenerator insightGenerator = mock(InsightGenerator.class);
        InsightService insightService = new InsightService(insightGenerator);
        InsightCommand command = command();
        InsightResult expected = new InsightResult(
                "소비 요약",
                List.of(
                        new InsightCard("주요 지출", "식비 지출이 가장 큽니다."),
                        new InsightCard("반복 소비", "반복 결제가 확인됩니다.")),
                "2026-08-11T22:00:00+09:00");
        given(insightGenerator.generate(command)).willReturn(expected);

        InsightResult actual = insightService.generate(command);

        assertThat(actual).isEqualTo(expected);
        verify(insightGenerator).generate(command);
    }

    private InsightCommand command() {
        return new InsightCommand(
                "ALL",
                null,
                List.of(new InsightTransaction(
                        "2026-08-01", "테스트 가맹점", null, "식비",
                        12000L, null, "APPROVED", true)));
    }
}
