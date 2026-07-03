package cop.kbds.agilemvp.rule.controller;

import jakarta.validation.constraints.NotBlank;

public record RuleDryRunRequest(
        @NotBlank(message = "키워드를 입력해주세요.")
        String keyword
) {}
