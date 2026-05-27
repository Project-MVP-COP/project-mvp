package cop.kbds.agilemvp.chart.infra;

import cop.kbds.agilemvp.chart.service.BarMonth;
import cop.kbds.agilemvp.chart.service.DonutSlice;
import cop.kbds.agilemvp.chart.service.LineDay;
import cop.kbds.agilemvp.chart.web.ChartSearchRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ChartRepositoryImpl implements ChartRepository {

    private final ChartMapper chartMapper;

    @Override
    public List<DonutSlice> donut(String dateStart, String dateEnd) {
        return chartMapper.donut(params(dateStart, dateEnd));
    }

    @Override
    public List<BarMonth> bar() {
        return chartMapper.bar();
    }

    @Override
    public List<LineDay> line(String dateStart, String dateEnd) {
        return chartMapper.line(params(dateStart, dateEnd));
    }

    private ChartSearchRequest params(String dateStart, String dateEnd) {
        ChartSearchRequest p = new ChartSearchRequest();
        p.setDateStart(dateStart);
        p.setDateEnd(dateEnd);
        return p;
    }
}
