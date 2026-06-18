package cop.kbds.agilemvp.chart.repository;

import cop.kbds.agilemvp.chart.controller.BarChartDto;
import cop.kbds.agilemvp.chart.controller.ChartSearchDto;
import cop.kbds.agilemvp.chart.controller.DonutChartDto;
import cop.kbds.agilemvp.chart.controller.LineChartDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ChartRepositoryImpl implements ChartRepository {
    private final ChartMapper chartMapper;

    @Override public List<DonutChartDto> donut(ChartSearchDto params) { return chartMapper.donut(params); }
    @Override public List<BarChartDto>   bar(ChartSearchDto params)   { return chartMapper.bar(params);   }
    @Override public List<LineChartDto>  line(ChartSearchDto params)  { return chartMapper.line(params);  }
}
