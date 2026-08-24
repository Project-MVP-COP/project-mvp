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

    MonthlyGoal findByIdAndUserIdForUpdate(
            @Param("id") Long id,
            @Param("userId") Long userId);

    MonthlyGoal findByIdAndUserId(
            @Param("id") Long id,
            @Param("userId") Long userId);

    int upsert(MonthlyGoal goal);

    MonthlyGoal findByUserIdAndGoalMonth(
            @Param("userId") Long userId,
            @Param("goalMonth") LocalDate goalMonth);

    int updateStatus(MonthlyGoal goal);
}
