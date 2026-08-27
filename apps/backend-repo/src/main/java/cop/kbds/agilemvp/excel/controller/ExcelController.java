package cop.kbds.agilemvp.excel.controller;

import cop.kbds.agilemvp.excel.service.ExcelService;
import cop.kbds.agilemvp.transaction.controller.TransactionDto;
import cop.kbds.agilemvp.user.service.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Tag(name = "excel", description = "엑셀 다운로드/업로드 API")
@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
@Slf4j
public class ExcelController {

    private final ExcelService excelService;

    @GetMapping("/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        byte[] bytes = excelService.generateTemplate();
        setExcelHeaders(response, "카드이용내역_양식.xlsx");
        response.getOutputStream().write(bytes);
    }

    @PostMapping("/download")
    public void downloadData(@RequestBody List<TransactionDto> transactions,
                             HttpServletResponse response) throws IOException {
        byte[] bytes = excelService.exportToExcel(transactions);
        setExcelHeaders(response, "카드이용내역_" + LocalDate.now() + ".xlsx");
        response.getOutputStream().write(bytes);
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.OK)
    public List<TransactionDto> uploadExcel(@RequestPart("file") MultipartFile file,
                                            @AuthenticationPrincipal User currentUser) {
        long startedAt = System.nanoTime();
        log.info("Excel upload started: userId={}, sizeBytes={}, contentType={}",
                currentUser.getId(), file.getSize(), file.getContentType());
        try {
            List<TransactionDto> transactions = excelService.parseUpload(file, currentUser.getId());
            log.info("Excel upload parsed: userId={}, rows={}, durationMs={}",
                    currentUser.getId(), transactions.size(), elapsedMillis(startedAt));
            return transactions;
        } catch (RuntimeException e) {
            log.warn("Excel upload failed: userId={}, sizeBytes={}, durationMs={}, exception={}",
                    currentUser.getId(), file.getSize(), elapsedMillis(startedAt), e.getClass().getSimpleName());
            throw e;
        }
    }

    private long elapsedMillis(long startedAt) {
        return (System.nanoTime() - startedAt) / 1_000_000;
    }

    private void setExcelHeaders(HttpServletResponse response, String filename) {
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + encoded + "\"");
    }
}
