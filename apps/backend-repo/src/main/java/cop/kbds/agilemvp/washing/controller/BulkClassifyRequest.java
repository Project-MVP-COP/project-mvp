package cop.kbds.agilemvp.washing.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkClassifyRequest(
        @NotEmpty(message = "세척 대상이 필요합니다.")
        List<Long> ids,

        @NotBlank(message = "카테고리가 필요합니다.")
        String category
) {
}
