package cop.kbds.agilemvp.rule.controller;

import cop.kbds.agilemvp.rule.service.Rule;

public record RuleResponse(
        Long id,
        String keyword,
        Long categoryId,
        String categoryName,
        String tag,
        Integer appliedCount
) {
    public static RuleResponse from(Rule rule) {
        return new RuleResponse(
                rule.getId(),
                rule.getKeyword(),
                rule.getCategoryId(),
                rule.getCategoryName(),
                rule.getTag(),
                rule.getAppliedCount()
        );
    }
}
