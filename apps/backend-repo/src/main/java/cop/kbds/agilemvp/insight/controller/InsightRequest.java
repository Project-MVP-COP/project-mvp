package cop.kbds.agilemvp.insight.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import cop.kbds.agilemvp.insight.service.InsightCommand;
import cop.kbds.agilemvp.insight.service.InsightCommand.InsightTransaction;

public record InsightRequest(
        @NotNull(message = "분석 기간을 선택해주세요.")
        @Schema(allowableValues = {"ALL", "LAST_1_MONTH", "LAST_3_MONTHS"})
        InsightPeriod period,

        @Schema(description = "전체 카테고리는 null")
        @Positive(message = "카테고리 ID는 양수여야 합니다.")
        Long categoryId,

        @NotEmpty(message = "분석할 거래 내역을 한 건 이상 입력해주세요.")
        List<@Valid InsightTransactionRequest> transactions
) {
    public InsightCommand toCommand() {
        List<InsightTransaction> commandTransactions = transactions.stream()
                .map(transaction -> new InsightTransaction(
                        transaction.transactionDate(),
                        transaction.merchant(),
                        transaction.categoryId(),
                        transaction.categoryName(),
                        transaction.amount(),
                        transaction.tag(),
                        transaction.status(),
                        transaction.isClassified()
                ))
                .toList();
        return new InsightCommand(period.name(), categoryId, commandTransactions);
    }
}
