package cop.kbds.agilemvp.chart;

import lombok.Data;

@Data
public class ChartSearchDto {
    private Long   userId;
    private String dateStart;
    private String dateEnd;
}
