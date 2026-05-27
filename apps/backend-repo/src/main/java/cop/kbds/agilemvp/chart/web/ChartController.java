package cop.kbds.agilemvp.chart.web;

import cop.kbds.agilemvp.chart.infra.ChartMapper;
import cop.kbds.agilemvp.chart.service.BarMonth;
import cop.kbds.agilemvp.chart.service.DonutSlice;
import cop.kbds.agilemvp.chart.service.LineDay;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/charts")
public class ChartController {

    private final ChartMapper chartMapper;

    public ChartController(ChartMapper chartMapper) {
        this.chartMapper = chartMapper;
    }

    @GetMapping("/donut")
    public List<DonutSlice> donut(ChartSearchRequest params) {
        return chartMapper.donut(params);
    }

    @GetMapping("/bar")
    public List<BarMonth> bar() {
        return chartMapper.bar();
    }

    @GetMapping("/line")
    public List<LineDay> line(ChartSearchRequest params) {
        return chartMapper.line(params);
    }
}
