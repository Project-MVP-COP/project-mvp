package cop.kbds.agilemvp.insight.controller;

import java.util.List;

import cop.kbds.agilemvp.insight.service.InsightResult;

public record InsightResponse(
        String summary,
        List<InsightCardResponse> cards,
        String generatedAt
) {
    public static InsightResponse from(InsightResult result) {
        List<InsightCardResponse> cards = result.cards().stream()
                .map(card -> new InsightCardResponse(card.title(), card.description()))
                .toList();
        return new InsightResponse(result.summary(), cards, result.generatedAt());
    }
}
