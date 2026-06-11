package cop.kbds.agilemvp.transaction;

import cop.kbds.agilemvp.excel.dto.TransactionDto;
import cop.kbds.agilemvp.user.service.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public TransactionDto findById(@PathVariable Long id) {
        return service.findById(id);
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

    @PutMapping("/{id}")
    public TransactionDto update(@PathVariable Long id, @RequestBody TransactionDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAll(@AuthenticationPrincipal User currentUser) {
        service.deleteAll(currentUser.getId());
    }

    @PostMapping("/reset")
    public List<TransactionDto> reset(@AuthenticationPrincipal User currentUser) {
        return service.reset(currentUser.getId());
    }
}
