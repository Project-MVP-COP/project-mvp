package cop.kbds.agilemvp.monthlygoal.repository;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoal;
import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoalStatus;

@Mapper
public interface MonthlyGoalMapper {
    List<MonthlyGoal> findAllByUserId(
            @Param("userId") Long userId,
            @Param("status") MonthlyGoalStatus status);

    int upsert(MonthlyGoal goal);

    MonthlyGoal findByUserIdAndGoalMonth(
            @Param("userId") Long userId,
            @Param("goalMonth") LocalDate goalMonth);
}
