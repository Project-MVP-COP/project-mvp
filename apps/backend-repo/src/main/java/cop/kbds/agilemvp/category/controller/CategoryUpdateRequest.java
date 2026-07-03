package cop.kbds.agilemvp.category.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CategoryUpdateRequest(
        @NotBlank(message = "카테고리명을 입력해주세요.")
        String name,

        @NotBlank(message = "색상을 선택해주세요.")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "올바른 색상 코드(#RRGGBB)를 입력해주세요.")
        String color
) {}
