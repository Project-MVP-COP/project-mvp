package cop.kbds.agilemvp.insight.controller;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        description = "인사이트 분석 기간",
        allowableValues = {"ALL", "LAST_1_MONTH", "LAST_3_MONTHS"}
)
public enum InsightPeriod {
    ALL,
    LAST_1_MONTH,
    LAST_3_MONTHS
}
