package cop.kbds.agilemvp.chart;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ChartMapper {
    List<DonutChartDto> donut(ChartSearchDto params);
    List<BarChartDto>   bar(ChartSearchDto params);
    List<LineChartDto>  line(ChartSearchDto params);
}
