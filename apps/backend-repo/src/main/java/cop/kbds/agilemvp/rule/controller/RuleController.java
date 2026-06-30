package cop.kbds.agilemvp.rule.controller;

import cop.kbds.agilemvp.rule.service.RuleDryRunResult;
import cop.kbds.agilemvp.rule.service.RuleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import cop.kbds.agilemvp.user.service.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "rule", description = "규칙 엔진 API")
@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class RuleController {

    private final RuleService ruleService;

    @GetMapping
    public List<RuleResponse> findAll(@AuthenticationPrincipal User currentUser) {
        return ruleService.findAll(currentUser.getId())
                .stream().map(RuleResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@RequestBody @Valid RuleCreateRequest request,
                       @AuthenticationPrincipal User currentUser) {
        ruleService.create(currentUser.getId(), request.keyword(), request.categoryId(), request.tag());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal User currentUser) {
        ruleService.delete(id, currentUser.getId());
    }

    @PostMapping("/dry-run")
    public RuleDryRunResponse dryRun(@RequestBody @Valid RuleDryRunRequest request,
                                     @AuthenticationPrincipal User currentUser) {
        RuleDryRunResult result = ruleService.dryRun(currentUser.getId(), request.keyword());
        return new RuleDryRunResponse(
                result.totalCount(),
                result.transactions().stream().map(RuleDryRunResponse.MatchedTransaction::from).toList()
        );
    }

    @GetMapping("/patterns")
    public List<RulePatternResponse> findUnclassifiedPatterns(@AuthenticationPrincipal User currentUser) {
        return ruleService.findUnclassifiedPatterns(currentUser.getId())
                .stream().map(RulePatternResponse::from).toList();
    }
}
