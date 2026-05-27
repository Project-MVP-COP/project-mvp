package cop.kbds.agilemvp.chart.repository;

import cop.kbds.agilemvp.chart.controller.BarMonth;
import cop.kbds.agilemvp.chart.controller.DonutSlice;
import cop.kbds.agilemvp.chart.controller.LineDay;
import cop.kbds.agilemvp.chart.controller.ChartSearchRequest;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ChartMapper {
    List<DonutSlice> donut(ChartSearchRequest params);
    List<BarMonth>   bar();
    List<LineDay>    line(ChartSearchRequest params);
}
