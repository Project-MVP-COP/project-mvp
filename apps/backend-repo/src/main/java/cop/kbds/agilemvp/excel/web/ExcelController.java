package cop.kbds.agilemvp.excel.web;

import cop.kbds.agilemvp.excel.service.ExcelService;
import cop.kbds.agilemvp.transaction.web.TransactionRequest;
import cop.kbds.agilemvp.transaction.web.TransactionResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/excel")
public class ExcelController {

    private final ExcelService excelService;

    public ExcelController(ExcelService excelService) {
        this.excelService = excelService;
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        byte[] bytes = excelService.generateTemplate();
        return ResponseEntity.ok()
                .headers(excelHeaders("카드이용내역_양식.xlsx"))
                .body(bytes);
    }

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadData(@RequestBody List<TransactionResponse> transactions) throws IOException {
        byte[] bytes = excelService.exportToExcel(transactions);
        String filename = "카드이용내역_" + LocalDate.now() + ".xlsx";
        return ResponseEntity.ok()
                .headers(excelHeaders(filename))
                .body(bytes);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadExcel(@RequestPart("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("파일이 비어있습니다.");
        String name = file.getOriginalFilename();
        if (name == null || (!name.endsWith(".xlsx") && !name.endsWith(".xls")))
            return ResponseEntity.badRequest().body(".xlsx 또는 .xls 파일만 업로드 가능합니다.");
        try {
            List<TransactionRequest> parsed = excelService.parseUpload(file);
            return ResponseEntity.ok(parsed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("파일 처리 오류: " + e.getMessage());
        }
    }

    private HttpHeaders excelHeaders(String filename) {
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encoded + "\"");
        return headers;
    }
}
