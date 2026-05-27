package cop.kbds.agilemvp.chart.infra;

import cop.kbds.agilemvp.chart.service.BarMonth;
import cop.kbds.agilemvp.chart.service.DonutSlice;
import cop.kbds.agilemvp.chart.service.LineDay;

import java.util.List;

public interface ChartRepository {
    List<DonutSlice> donut(String dateStart, String dateEnd);
    List<BarMonth>   bar();
    List<LineDay>    line(String dateStart, String dateEnd);
}
