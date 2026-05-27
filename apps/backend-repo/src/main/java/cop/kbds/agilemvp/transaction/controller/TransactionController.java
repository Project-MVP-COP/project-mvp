package cop.kbds.agilemvp.transaction.controller;

import cop.kbds.agilemvp.transaction.service.TransactionService;
import cop.kbds.agilemvp.transaction.service.TransactionSummary;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "transaction", description = "카드 이용내역 API")
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;

    @GetMapping
    public List<TransactionResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/search")
    public TransactionPageResponse search(TransactionSearchRequest params) {
        return service.search(params);
    }

    @GetMapping("/summary")
    public TransactionSummary summary(TransactionSearchRequest params) {
        return service.summary(params);
    }

    @GetMapping("/{id}")
    public TransactionResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse add(@RequestBody @Valid TransactionRequest req) {
        return service.add(req);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public List<TransactionResponse> addBulk(@RequestBody List<TransactionRequest> list) {
        return service.addBulk(list);
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@PathVariable Long id,
                                      @RequestBody @Valid TransactionRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAll() {
        service.deleteAll();
    }

    @PostMapping("/reset")
    public List<TransactionResponse> reset() {
        return service.reset();
    }
}
