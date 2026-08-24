package cop.kbds.agilemvp.monthlygoal.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.monthlygoal.exception.MonthlyGoalErrorCode;
import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoal;
import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoalStatus;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class MonthlyGoalRepositoryImpl implements MonthlyGoalRepository {

    private final MonthlyGoalMapper monthlyGoalMapper;

    @Override
    public List<MonthlyGoal> findAllByUserId(Long userId, MonthlyGoalStatus status) {
        return monthlyGoalMapper.findAllByUserId(userId, status);
    }

    @Override
    public MonthlyGoal findByIdAndUserIdForUpdate(Long id, Long userId) {
        return monthlyGoalMapper.findByIdAndUserIdForUpdate(id, userId);
    }

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

    @Override
    public MonthlyGoal updateStatus(MonthlyGoal goal) {
        int updated = monthlyGoalMapper.updateStatus(goal);
        if (updated != 1) {
            throw new BusinessException(MonthlyGoalErrorCode.UPDATE_FAILED);
        }
        MonthlyGoal saved = monthlyGoalMapper.findByIdAndUserId(goal.getId(), goal.getUserId());
        if (saved == null) {
            throw new BusinessException(MonthlyGoalErrorCode.UPDATE_FAILED);
        }
        return saved;
    }
}
