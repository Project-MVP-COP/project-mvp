package cop.kbds.agilemvp.insight.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record InsightTransactionRequest(
        @NotBlank(message = "거래 일자를 입력해주세요.")
        @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "거래 일자는 yyyy-MM-dd 형식이어야 합니다.")
        String transactionDate,

        @NotBlank(message = "가맹점명을 입력해주세요.")
        String merchant,

        @Positive(message = "카테고리 ID는 양수여야 합니다.")
        Long categoryId,
        String categoryName,

        @NotNull(message = "거래 금액을 입력해주세요.")
        @PositiveOrZero(message = "거래 금액은 0 이상이어야 합니다.")
        Long amount,

        String tag,
        String status,
        Boolean isClassified
) {}
