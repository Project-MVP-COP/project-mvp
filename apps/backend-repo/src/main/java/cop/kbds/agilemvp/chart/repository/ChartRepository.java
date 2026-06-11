package cop.kbds.agilemvp.chart.repository;

import cop.kbds.agilemvp.chart.controller.BarChartDto;
import cop.kbds.agilemvp.chart.controller.ChartSearchDto;
import cop.kbds.agilemvp.chart.controller.DonutChartDto;
import cop.kbds.agilemvp.chart.controller.LineChartDto;

import java.util.List;

public interface ChartRepository {
    List<DonutChartDto> donut(ChartSearchDto params);
    List<BarChartDto>   bar(ChartSearchDto params);
    List<LineChartDto>  line(ChartSearchDto params);
}
