package cop.kbds.agilemvp.insight.service;

import java.util.List;

public record InsightResult(
        String summary,
        List<InsightCard> cards,
        String generatedAt
) {
    public record InsightCard(String title, String description) {}
}
