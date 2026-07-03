package cop.kbds.agilemvp.rule.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RuleCreateRequest(
        @NotBlank(message = "키워드를 입력해주세요.")
        String keyword,

        @NotNull(message = "카테고리를 선택해주세요.")
        Long categoryId,

        String tag
) {}
