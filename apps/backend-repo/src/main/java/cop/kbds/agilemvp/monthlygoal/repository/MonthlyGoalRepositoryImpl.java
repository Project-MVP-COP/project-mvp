package cop.kbds.agilemvp.monthlygoal.repository;

import org.springframework.stereotype.Repository;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.monthlygoal.exception.MonthlyGoalErrorCode;
import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoal;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class MonthlyGoalRepositoryImpl implements MonthlyGoalRepository {

    private final MonthlyGoalMapper monthlyGoalMapper;

    @Override
    public MonthlyGoal saveOrReplace(MonthlyGoal goal) {
        monthlyGoalMapper.upsert(goal);
        MonthlyGoal saved = monthlyGoalMapper.findByUserIdAndGoalMonth(
                goal.getUserId(), goal.getGoalMonth());
        if (saved == null) {
            throw new BusinessException(MonthlyGoalErrorCode.SAVE_FAILED);
        }
        return saved;
    }
}
