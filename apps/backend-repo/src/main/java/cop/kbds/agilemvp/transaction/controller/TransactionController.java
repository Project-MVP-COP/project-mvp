package cop.kbds.agilemvp.transaction.controller;

import cop.kbds.agilemvp.common.annotation.FeatureToggle;
import cop.kbds.agilemvp.transaction.service.TransactionService;
import cop.kbds.agilemvp.user.service.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "transaction", description = "카드이용내역 API")
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;

    @GetMapping
    public List<TransactionDto> findAll(@AuthenticationPrincipal User currentUser) {
        return service.findAll(currentUser.getId());
    }

    @GetMapping("/search")
    public TransactionPageResult search(TransactionSearchDto params,
                                        @AuthenticationPrincipal User currentUser) {
        params.setUserId(currentUser.getId());
        return service.search(params);
    }

    @GetMapping("/summary")
    public TransactionSummaryDto summary(TransactionSearchDto params,
                                         @AuthenticationPrincipal User currentUser) {
        params.setUserId(currentUser.getId());
        return service.summary(params);
    }

    @GetMapping("/{id}")
    public TransactionDto findById(@PathVariable Long id,
                                   @AuthenticationPrincipal User currentUser) {
        return service.findById(id, currentUser.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDto add(@RequestBody TransactionDto dto,
                              @AuthenticationPrincipal User currentUser) {
        return service.add(dto, currentUser.getId());
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public BulkUploadResult addBulk(@RequestBody List<TransactionDto> list,
                                    @AuthenticationPrincipal User currentUser) {
        return service.addBulk(list, currentUser.getId());
    }

    @PatchMapping("/{id}/category")
    public TransactionDto patchCategory(@PathVariable Long id,
                                        @RequestBody @Valid CategoryPatchRequest request,
                                        @AuthenticationPrincipal User currentUser) {
        return service.patchCategory(id, request.categoryId(), currentUser.getId());
    }

    @PatchMapping("/{id}/tag")
    public TransactionDto patchTag(@PathVariable Long id,
                                   @RequestBody TagPatchRequest request,
                                   @AuthenticationPrincipal User currentUser) {
        return service.patchTag(id, request.tag(), currentUser.getId());
    }

    @PutMapping("/{id}")
    public TransactionDto update(@PathVariable Long id,
                                 @RequestBody TransactionDto dto,
                                 @AuthenticationPrincipal User currentUser) {
        return service.update(id, dto, currentUser.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal User currentUser) {
        service.delete(id, currentUser.getId());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAll(@AuthenticationPrincipal User currentUser) {
        service.deleteAll(currentUser.getId());
    }

    @FeatureToggle("transaction.reset")
    @PostMapping("/reset")
    public List<TransactionDto> reset(@AuthenticationPrincipal User currentUser) {
        return service.reset(currentUser.getId());
    }
}
