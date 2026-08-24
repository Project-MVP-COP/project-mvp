package cop.kbds.agilemvp.monthlygoal.controller;

import java.time.YearMonth;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoalService;
import cop.kbds.agilemvp.monthlygoal.service.MonthlyGoalStatus;
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

    @GetMapping
    public List<MonthlyGoalResponse> findAll(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal User currentUser) {
        MonthlyGoalStatus goalStatus = status != null ? MonthlyGoalStatus.from(status) : null;
        return monthlyGoalService.findAll(currentUser.getId(), goalStatus).stream()
                .map(MonthlyGoalResponse::from)
                .toList();
    }

    @PatchMapping("/{goalId}/status")
    public MonthlyGoalResponse updateStatus(
            @PathVariable Long goalId,
            @RequestBody @Valid MonthlyGoalStatusUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return MonthlyGoalResponse.from(monthlyGoalService.updateStatus(
                currentUser.getId(),
                goalId,
                MonthlyGoalStatus.from(request.status()),
                request.actualSaved()));
    }

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
