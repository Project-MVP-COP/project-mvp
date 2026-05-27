package cop.kbds.agilemvp.chart.infra;

import cop.kbds.agilemvp.chart.service.BarMonth;
import cop.kbds.agilemvp.chart.service.DonutSlice;
import cop.kbds.agilemvp.chart.service.LineDay;
import cop.kbds.agilemvp.chart.web.ChartSearchRequest;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ChartMapper {
    List<DonutSlice> donut(ChartSearchRequest params);
    List<BarMonth>   bar();
    List<LineDay>    line(ChartSearchRequest params);
}
