package cop.kbds.agilemvp.transaction;

import lombok.Data;

@Data
public class TransactionSearchDto {
    private Long   userId;
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
    private int    page      = 0;
    private int    size      = 20;

    public int getOffset() { return page * size; }
}
