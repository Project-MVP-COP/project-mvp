package cop.kbds.agilemvp.chart.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LineDay {
    private final String date;
    private final Long   cumulativeAmount;
}
