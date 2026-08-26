package cop.kbds.agilemvp.monthlygoal.repository;

import java.util.List;

import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoal;
import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoalStatus;

public interface MonthlyGoalRepository {
    List<MonthlyGoal> findAllByUserId(Long userId, MonthlyGoalStatus status);

    MonthlyGoal findByIdAndUserIdForUpdate(Long id, Long userId);

    MonthlyGoal saveOrReplace(MonthlyGoal goal);

    MonthlyGoal updateStatus(MonthlyGoal goal);
}
