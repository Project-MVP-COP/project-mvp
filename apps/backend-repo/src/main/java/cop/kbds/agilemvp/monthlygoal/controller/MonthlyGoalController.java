package cop.kbds.agilemvp.monthlygoal.controller;

import java.time.YearMonth;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoalService;
import cop.kbds.agilemvp.user.service.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "monthly-goal", description = "월 절감 목표 API")
@RestController
@RequestMapping("/api/monthly-goals")
@RequiredArgsConstructor
public class MonthlyGoalController {

    private final MonthlyGoalService monthlyGoalService;

    @PutMapping("/{goalMonth}")
    public MonthlyGoalResponse upsert(
            @PathVariable("goalMonth") @DateTimeFormat(pattern = "yyyy-MM") YearMonth goalMonth,
            @RequestBody @Valid MonthlyGoalUpsertRequest request,
            @AuthenticationPrincipal User currentUser) {
        return MonthlyGoalResponse.from(monthlyGoalService.upsert(
                currentUser.getId(),
                goalMonth,
                request.title(),
                request.targetCategory(),
                request.reductionRatio(),
                request.baselineAmount(),
                request.monthlySave()));
    }
}
