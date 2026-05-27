package cop.kbds.agilemvp.chart.controller;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChartSearchRequest {
    private String dateStart;
    private String dateEnd;
}
