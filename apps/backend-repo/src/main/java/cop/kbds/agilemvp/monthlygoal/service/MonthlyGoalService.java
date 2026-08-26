package cop.kbds.agilemvp.monthlygoal.service;

import java.math.BigDecimal;
import java.time.YearMonth;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cop.kbds.agilemvp.monthlygoal.repository.MonthlyGoalRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MonthlyGoalService {

    private final MonthlyGoalRepository monthlyGoalRepository;

    @Transactional
    public MonthlyGoal upsert(
            Long userId,
            YearMonth goalMonth,
            String title,
            String targetCategory,
            BigDecimal reductionRatio,
            Long baselineAmount,
            Long monthlySave) {
        MonthlyGoal goal = MonthlyGoal.create(
                userId,
                goalMonth != null ? goalMonth.atDay(1) : null,
                title,
                targetCategory,
                reductionRatio,
                baselineAmount,
                monthlySave);
        return monthlyGoalRepository.saveOrReplace(goal);
    }
}
