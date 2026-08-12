package cop.kbds.agilemvp.insight.service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import cop.kbds.agilemvp.insight.service.InsightResult.InsightCard;

@Component
@ConditionalOnProperty(prefix = "bedrock", name = "enabled", havingValue = "false", matchIfMissing = true)
public class MockInsightGenerator implements InsightGenerator {

    @Override
    public InsightResult generate(InsightCommand command) {
        return new InsightResult(
                "선택한 기간의 소비 내역을 분석했습니다. 주요 지출 영역과 반복되는 소비 패턴을 확인해 보세요.",
                List.of(
                        new InsightCard(
                                "가장 큰 지출 영역",
                                "선택한 기간에는 식비와 생활비 영역의 지출 비중이 가장 높았습니다."),
                        new InsightCard(
                                "반복 소비 패턴",
                                "같은 가맹점에서 반복된 결제가 있어 정기 지출 여부를 확인해 볼 수 있습니다."),
                        new InsightCard(
                                "소비 점검 포인트",
                                "소액 결제가 여러 번 발생한 영역을 먼저 점검하면 지출 흐름을 파악하기 쉽습니다.")
                ),
                OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
        );
    }
}
