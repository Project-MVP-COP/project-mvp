package cop.kbds.agilemvp.rule.controller;

public record RulePatternResponse(
        String keyword,
        int occurrences,
        long totalAmount
) {}
