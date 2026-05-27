package cop.kbds.agilemvp.chart.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DonutSlice {
    private final String name;
    private final Long   value;
    private final String color;
}
