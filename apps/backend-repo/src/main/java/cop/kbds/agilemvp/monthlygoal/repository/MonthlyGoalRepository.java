package cop.kbds.agilemvp.monthlygoal.repository;

import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoal;

public interface MonthlyGoalRepository {
    MonthlyGoal saveOrReplace(MonthlyGoal goal);
}
