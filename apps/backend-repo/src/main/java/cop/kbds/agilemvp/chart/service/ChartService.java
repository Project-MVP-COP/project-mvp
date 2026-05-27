package cop.kbds.agilemvp.chart.service;

import cop.kbds.agilemvp.chart.repository.ChartRepository;
import cop.kbds.agilemvp.chart.controller.ChartSearchRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChartService {

    private final ChartRepository chartRepository;

    public List<DonutSlice> donut(ChartSearchRequest params) {
        return chartRepository.donut(params.getDateStart(), params.getDateEnd());
    }

    public List<BarMonth> bar() {
        return chartRepository.bar();
    }

    public List<LineDay> line(ChartSearchRequest params) {
        return chartRepository.line(params.getDateStart(), params.getDateEnd());
    }
}
