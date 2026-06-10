package com.example.demo.excel.controller;

import com.example.demo.excel.dto.TransactionDto;
import com.example.demo.excel.service.ExcelService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
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
    public List<TransactionDto> uploadExcel(@RequestPart("file") MultipartFile file) {
        return excelService.parseUpload(file);
    }

    private void setExcelHeaders(HttpServletResponse response, String filename) {
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + encoded + "\"");
    }
}
