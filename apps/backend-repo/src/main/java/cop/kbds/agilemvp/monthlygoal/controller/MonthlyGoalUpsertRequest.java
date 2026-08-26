package cop.kbds.agilemvp.monthlygoal.controller;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record MonthlyGoalUpsertRequest(
        @NotBlank(message = "목표 제목을 입력해주세요.")
        @Size(max = 100, message = "목표 제목은 100자 이하여야 합니다.")
        String title,

        @NotBlank(message = "대상 카테고리를 입력해주세요.")
        @Size(max = 100, message = "대상 카테고리는 100자 이하여야 합니다.")
        String targetCategory,

        @NotNull(message = "절감 비율을 입력해주세요.")
        @DecimalMin(value = "0.0001", message = "절감 비율은 0보다 커야 합니다.")
        @DecimalMax(value = "1.0000", message = "절감 비율은 1 이하여야 합니다.")
        @Digits(integer = 1, fraction = 4, message = "절감 비율은 소수점 4자리까지 입력할 수 있습니다.")
        @Schema(example = "0.3", minimum = "0.0001", maximum = "1.0")
        BigDecimal reductionRatio,

        @NotNull(message = "기준 금액을 입력해주세요.")
        @Positive(message = "기준 금액은 0보다 커야 합니다.")
        Long baselineAmount,

        @NotNull(message = "월 절감액을 입력해주세요.")
        @Positive(message = "월 절감액은 0보다 커야 합니다.")
        Long monthlySave
) {
}
