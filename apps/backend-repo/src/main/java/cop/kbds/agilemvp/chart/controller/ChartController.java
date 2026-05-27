package cop.kbds.agilemvp.chart.controller;

import cop.kbds.agilemvp.chart.service.ChartService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "chart", description = "시각화 차트 API")
@RestController
@RequestMapping("/api/charts")
@RequiredArgsConstructor
public class ChartController {

    private final ChartService chartService;

    @GetMapping("/donut")
    public List<DonutSlice> donut(ChartSearchRequest params) {
        return chartService.donut(params);
    }

    @GetMapping("/bar")
    public List<BarMonth> bar() {
        return chartService.bar();
    }

    @GetMapping("/line")
    public List<LineDay> line(ChartSearchRequest params) {
        return chartService.line(params);
    }
}
