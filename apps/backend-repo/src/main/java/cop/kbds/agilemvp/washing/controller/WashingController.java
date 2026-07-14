package cop.kbds.agilemvp.washing.controller;

import cop.kbds.agilemvp.user.service.User;
import cop.kbds.agilemvp.washing.service.WashingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "washing", description = "거래 세척 화면 호환 API")
@RestController
@RequestMapping("/api/washing")
@RequiredArgsConstructor
public class WashingController {

    private final WashingService washingService;

    @GetMapping("/overview")
    public WashingOverviewResponse overview(@AuthenticationPrincipal User currentUser) {
        return washingService.getOverview(currentUser.getId());
    }

    @PostMapping("/bulk-classify")
    public WashingOverviewResponse bulkClassify(@RequestBody @Valid BulkClassifyRequest request,
                                                @AuthenticationPrincipal User currentUser) {
        return washingService.bulkClassify(request.ids(), request.category(), currentUser.getId());
    }

    @PostMapping("/import-mock")
    @ResponseStatus(HttpStatus.CREATED)
    public WashingOverviewResponse importMock(@AuthenticationPrincipal User currentUser) {
        return washingService.importMock(currentUser.getId());
    }

    @PatchMapping("/transactions/{id}/category")
    public WashingTransactionResponse patchCategory(@PathVariable Long id,
                                                    @RequestBody WashingCategoryPatchRequest request,
                                                    @AuthenticationPrincipal User currentUser) {
        return washingService.patchCategory(id, request.category(), currentUser.getId());
    }
}
