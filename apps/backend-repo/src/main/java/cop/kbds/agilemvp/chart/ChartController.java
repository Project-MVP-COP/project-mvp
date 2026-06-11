package cop.kbds.agilemvp.chart;

import cop.kbds.agilemvp.user.service.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/charts")
@RequiredArgsConstructor
public class ChartController {

    private final ChartMapper mapper;

    @GetMapping("/donut")
    public List<DonutChartDto> donut(ChartSearchDto params, @AuthenticationPrincipal User currentUser) {
        params.setUserId(currentUser.getId());
        return mapper.donut(params);
    }

    @GetMapping("/bar")
    public List<BarChartDto> bar(ChartSearchDto params, @AuthenticationPrincipal User currentUser) {
        params.setUserId(currentUser.getId());
        return mapper.bar(params);
    }

    @GetMapping("/line")
    public List<LineChartDto> line(ChartSearchDto params, @AuthenticationPrincipal User currentUser) {
        params.setUserId(currentUser.getId());
        return mapper.line(params);
    }
}
