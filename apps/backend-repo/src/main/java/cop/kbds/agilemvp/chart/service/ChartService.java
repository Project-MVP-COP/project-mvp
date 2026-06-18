package cop.kbds.agilemvp.chart.service;

import cop.kbds.agilemvp.chart.controller.BarChartDto;
import cop.kbds.agilemvp.chart.controller.ChartSearchDto;
import cop.kbds.agilemvp.chart.controller.DonutChartDto;
import cop.kbds.agilemvp.chart.controller.LineChartDto;
import cop.kbds.agilemvp.chart.repository.ChartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChartService {
    private final ChartRepository chartRepository;

    public List<DonutChartDto> donut(ChartSearchDto params) { return chartRepository.donut(params); }
    public List<BarChartDto>   bar(ChartSearchDto params)   { return chartRepository.bar(params);   }
    public List<LineChartDto>  line(ChartSearchDto params)  { return chartRepository.line(params);  }
}
