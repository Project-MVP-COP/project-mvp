package cop.kbds.agilemvp.transaction.web;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransactionSearchRequest {
    private String dateStart;
    private String dateEnd;
    private String categoryName;
    private Long   amountMin;
    private Long   amountMax;
    private String cardName;
    private String status;
    private String search;
    private String sortField = "date";
    private String sortOrder = "desc";
    private int    size      = 20;
    private int    offset    = 0;
}
