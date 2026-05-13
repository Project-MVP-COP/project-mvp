package com.example.demo.transaction;

import com.example.demo.excel.dto.TransactionDto;
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
    public List<TransactionDto> findAll() {
        return service.findAll();
    }

    @PostMapping
    public TransactionDto add(@RequestBody TransactionDto dto) {
        return service.add(dto);
    }

    @PostMapping("/bulk")
    public List<TransactionDto> addBulk(@RequestBody List<TransactionDto> list) {
        return service.addBulk(list);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody TransactionDto dto) {
        try {
            return ResponseEntity.ok(service.update(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
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
    public List<TransactionDto> reset() {
        return service.reset();
    }
}
