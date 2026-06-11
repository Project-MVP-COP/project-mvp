package cop.kbds.agilemvp.chart.controller;

import lombok.Data;

@Data
public class ChartSearchDto {
    private Long   userId;
    private String dateStart;
    private String dateEnd;
}
