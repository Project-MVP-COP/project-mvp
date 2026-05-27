package cop.kbds.agilemvp.transaction.web;

import cop.kbds.agilemvp.transaction.service.TransactionService;
import cop.kbds.agilemvp.transaction.service.TransactionSummary;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

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
    public ResponseEntity<TransactionResponse> findById(@PathVariable Long id) {
        TransactionResponse resp = service.findById(id);
        if (resp == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(resp);
    }

    @PostMapping
    public TransactionResponse add(@RequestBody TransactionRequest req) {
        return service.add(req);
    }

    @PostMapping("/bulk")
    public List<TransactionResponse> addBulk(@RequestBody List<TransactionRequest> list) {
        return service.addBulk(list);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(@PathVariable Long id,
                                                      @RequestBody TransactionRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll() {
        service.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset")
    public List<TransactionResponse> reset() {
        return service.reset();
    }
}
