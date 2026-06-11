package cop.kbds.agilemvp.chart.controller;

import lombok.Data;

@Data
public class LineChartDto {
    private String date;
    private long   cumulativeAmount;
}
