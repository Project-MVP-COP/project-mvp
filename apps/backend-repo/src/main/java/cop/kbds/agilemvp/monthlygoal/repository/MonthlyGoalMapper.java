package cop.kbds.agilemvp.monthlygoal.repository;

import java.time.LocalDate;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoal;

@Mapper
public interface MonthlyGoalMapper {
    int upsert(MonthlyGoal goal);

    MonthlyGoal findByUserIdAndGoalMonth(
            @Param("userId") Long userId,
            @Param("goalMonth") LocalDate goalMonth);
}
