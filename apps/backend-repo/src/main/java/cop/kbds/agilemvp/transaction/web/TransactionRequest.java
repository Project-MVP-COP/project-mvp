package cop.kbds.agilemvp.transaction.web;

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
    private Long   id;       // MyBatis insert 후 생성된 PK 수신
    private Long   userId;   // 서비스 계층에서 설정
    private String transactionDate;
    private String merchant;
    private Long   categoryId;
    private String categoryName;
    private Long   amount;
    private String cardName;
    private int    installment = 1;
    private String status      = "승인";
    private String memo;
}
