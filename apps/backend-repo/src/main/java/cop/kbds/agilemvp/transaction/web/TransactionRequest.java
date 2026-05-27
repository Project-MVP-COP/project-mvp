package cop.kbds.agilemvp.transaction.web;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 거래 생성/수정 요청 DTO. MyBatis insert 시 useGeneratedKeys로 id가 주입되므로 Setter 허용.
 */
@Getter
@Setter
@NoArgsConstructor
public class TransactionRequest {
    private Long   id;
    private Long   userId;

    @NotBlank(message = "거래일은 필수입니다.")
    private String transactionDate;

    @NotBlank(message = "가맹점명은 필수입니다.")
    private String merchant;

    private Long   categoryId;
    private String categoryName;

    @NotNull(message = "금액은 필수입니다.")
    @Min(value = 0, message = "금액은 0 이상이어야 합니다.")
    private Long   amount;

    private String cardName;
    private int    installment = 1;
    private String status      = "승인";
    private String memo;
}
