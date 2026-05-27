package cop.kbds.agilemvp.chart.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BarMonth {
    private final String month;
    private final Long   amount;
}
