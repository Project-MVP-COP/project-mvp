package cop.kbds.agilemvp.rule.service;

public record RulePattern(
        String keyword,
        int occurrences,
        long totalAmount
) {}
