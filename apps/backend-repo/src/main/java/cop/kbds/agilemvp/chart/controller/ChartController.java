package cop.kbds.agilemvp.chart.controller;

import cop.kbds.agilemvp.chart.service.ChartService;
import cop.kbds.agilemvp.user.service.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "chart", description = "차트 API")
@RestController
@RequestMapping("/api/charts")
@RequiredArgsConstructor
public class ChartController {

    private final ChartService chartService;

    @GetMapping("/donut")
    public List<DonutChartDto> donut(ChartSearchDto params,
                                     @AuthenticationPrincipal User currentUser) {
        params.setUserId(currentUser.getId());
        return chartService.donut(params);
    }

    @GetMapping("/bar")
    public List<BarChartDto> bar(ChartSearchDto params,
                                 @AuthenticationPrincipal User currentUser) {
        params.setUserId(currentUser.getId());
        return chartService.bar(params);
    }

    @GetMapping("/line")
    public List<LineChartDto> line(ChartSearchDto params,
                                   @AuthenticationPrincipal User currentUser) {
        params.setUserId(currentUser.getId());
        return chartService.line(params);
    }
}
