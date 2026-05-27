package cop.kbds.agilemvp.chart.repository;

import cop.kbds.agilemvp.chart.controller.BarMonth;
import cop.kbds.agilemvp.chart.controller.DonutSlice;
import cop.kbds.agilemvp.chart.controller.LineDay;

import java.util.List;

public interface ChartRepository {
    List<DonutSlice> donut(String dateStart, String dateEnd);
    List<BarMonth>   bar();
    List<LineDay>    line(String dateStart, String dateEnd);
}
