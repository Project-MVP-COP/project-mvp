package cop.kbds.agilemvp.rule.service;

public record RuleDryRunSummaryDto(
        int matchCount,
        int newlyClassifiedCount,
        int overrideCount
) {}
