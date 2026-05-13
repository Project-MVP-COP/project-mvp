package com.example.demo.excel.service;

import com.example.demo.excel.dto.TransactionDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ExcelService {

    private static final String[] HEADERS = {"날짜", "가맹점명", "카테고리", "금액", "카드명", "할부개월", "상태"};
    private static final List<String> VALID_CATEGORIES = List.of(
            "식음료", "쇼핑", "교통", "의료/건강", "문화/여가", "편의점", "주유", "통신", "교육", "기타"
    );
    private static final List<String> VALID_STATUSES = List.of("승인", "취소");

    /* ── 카드사 감지 ────────────────────────────────────────────── */

    private enum BankType { SHINHAN, KB, TEMPLATE, UNKNOWN }

    private BankType detectBankType(Workbook wb) {
        Sheet sheet = wb.getSheetAt(0);
        // 최대 10행 안에서 헤더 행을 탐색
        for (int r = 0; r < Math.min(10, sheet.getLastRowNum() + 1); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;
            Set<String> cells = new HashSet<>();
            for (int c = 0; c < row.getLastCellNum(); c++) {
                String val = getCellString(row, c).replaceAll("\\s+", "").toLowerCase();
                cells.add(val);
            }
            if (cells.contains("거래일") && cells.contains("취소상태"))  return BankType.SHINHAN;
            if (cells.contains("이용하신곳") && cells.contains("이용일")) return BankType.KB;
            if (cells.contains("날짜") && cells.contains("카테고리"))    return BankType.TEMPLATE;
        }
        return BankType.UNKNOWN;
    }

    /* ── 카테고리 자동 분류 ─────────────────────────────────────── */

    private static final List<String[]> CATEGORY_RULES = List.of(
        new String[]{"식음료",   "스타벅스,쿠팡이츠,배달의민족,맥도날드,버거킹,롯데리아,KFC,서브웨이,빽다방,메가커피,메가MGC,투썸,이디야,던킨,파리바게뜨,뚜레쥬르,카멜커피,셀렉커피,브알라,대접,뉴쎄일마트,신선청과,빵연구소,치킨,피자,라멘,분식,식당,카페,커피,음식점"},
        new String[]{"쇼핑",     "쿠팡,이마트,롯데,신세계,현대백화점,홈플러스,코스트코,다이소,아성다이소,무신사,올리브영,네이버쇼핑,G마켓,11번가,위메프,트레이더스,인터파크,SSG,쿠팡(주)"},
        new String[]{"교통",     "한국철도공사,철도,KTX,SRT,카카오택시,티머니,버스,지하철,항공,우버,코레일,철도승차권"},
        new String[]{"의료/건강","병원,의원,약국,클리닉,한의원,치과,안과,피부과,이비인후과,세브란스,서울대병원,올리브영약국"},
        new String[]{"문화/여가","CGV,롯데시네마,메가박스,넷플릭스,유튜브,왓챠,쿠팡플레이,게임,공연,뮤지컬,전시,스포츠"},
        new String[]{"편의점",   "GS25,세븐일레븐,CU,씨유,이마트24,미니스톱,스토리웨이"},
        new String[]{"주유",     "SK에너지,GS칼텍스,현대오일뱅크,S-OIL,에쓰오일,주유소,오일뱅크"},
        new String[]{"통신",     "SKT,KT,LGU,LG U,통신,알뜰폰"},
        new String[]{"교육",     "인프런,클래스101,유데미,coursera,학원,교육,강의"}
    );

    private String classifyCategory(String merchant) {
        String m = merchant.toLowerCase();
        for (String[] rule : CATEGORY_RULES) {
            for (String kw : rule[1].split(",")) {
                if (m.contains(kw.toLowerCase())) return rule[0];
            }
        }
        return "기타";
    }

    /* ── 신한카드 파서 ──────────────────────────────────────────── */
    // 헤더: 거래일 | 카드구분 | 이용카드 | 가맹점명 | 승인번호 | 금액 | 매입구분 | 이용구분 | 거래통화 | 해외이용금액 | 취소상태

    private List<TransactionDto> parseShinhancardFormat(Workbook wb) {
        Sheet sheet = wb.getSheetAt(0);
        Row headerRow = findHeaderRow(sheet, "거래일");
        if (headerRow == null) throw new IllegalArgumentException("[신한카드] 헤더 행을 찾을 수 없습니다.");

        Map<String, Integer> ci = buildColIndex(headerRow);
        List<TransactionDto> result = new ArrayList<>();
        long tempId = 1;

        for (int r = headerRow.getRowNum() + 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String rawDate = getCellString(row, ci.get("거래일"));
            if (rawDate.isBlank()) continue;

            // "2026.02.28 22:32" → "2026-02-28"
            String date = rawDate.substring(0, 10).replace(".", "-");

            String merchant   = getCellString(row, ci.getOrDefault("가맹점명", -1));
            long   amount     = getCellLong(row,   ci.getOrDefault("금액", -1));
            String issueType  = getCellString(row, ci.getOrDefault("이용구분", -1));
            String cancelFlag = getCellString(row, ci.getOrDefault("취소상태", -1));

            int installment = parseInstallmentShinhan(issueType);
            String status   = cancelFlag.isBlank() ? "승인" : "취소";

            result.add(TransactionDto.builder()
                    .id(tempId++).date(date).merchant(merchant)
                    .category(classifyCategory(merchant))
                    .amount(amount).card("신한카드")
                    .installment(installment).status(status)
                    .build());
        }
        return result;
    }

    private int parseInstallmentShinhan(String issueType) {
        if (issueType == null || issueType.isBlank() || issueType.contains("일시불")) return 1;
        Matcher m = Pattern.compile("(\\d+)").matcher(issueType);
        return m.find() ? Integer.parseInt(m.group(1)) : 1;
    }

    /* ── KB국민카드 파서 ────────────────────────────────────────── */
    // 메타 rows(1~6행) → 7행이 실제 헤더
    // 헤더: 이용일 | 이용시간 | 이용고객명 | 이용카드명 | 이용하신곳 | 국내이용금액(원) | ... | 결제방법 | ... | 상태 | ...

    private List<TransactionDto> parseKbFormat(Workbook wb) {
        Sheet sheet = wb.getSheetAt(0);
        Row headerRow = findHeaderRow(sheet, "이용하신곳");
        if (headerRow == null) throw new IllegalArgumentException("[KB국민카드] 헤더 행을 찾을 수 없습니다.");

        Map<String, Integer> ci = buildColIndex(headerRow);
        List<TransactionDto> result = new ArrayList<>();
        long tempId = 1;

        for (int r = headerRow.getRowNum() + 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String date = getCellString(row, ci.getOrDefault("이용일", -1));
            if (date.isBlank()) continue;

            String merchant    = getCellString(row, ci.getOrDefault("이용하신곳", -1));
            long   amount      = getCellLong(row,   ci.getOrDefault("국내이용금액(원)", -1));
            String payMethod   = getCellString(row, ci.getOrDefault("결제방법", -1));
            String statusRaw   = getCellString(row, ci.getOrDefault("상태", -1));

            int    installment = parseInstallmentKb(payMethod);
            String status      = statusRaw.contains("취소") ? "취소" : "승인";

            result.add(TransactionDto.builder()
                    .id(tempId++).date(date).merchant(merchant)
                    .category(classifyCategory(merchant))
                    .amount(amount).card("국민카드")
                    .installment(installment).status(status)
                    .build());
        }
        return result;
    }

    private int parseInstallmentKb(String payMethod) {
        if (payMethod == null || payMethod.isBlank() || payMethod.contains("일시불") || payMethod.contains("포인트")) return 1;
        // "무이자5", "할부3" 등에서 숫자 추출
        Matcher m = Pattern.compile("(\\d+)").matcher(payMethod);
        return m.find() ? Integer.parseInt(m.group(1)) : 1;
    }

    /* ── 기존 템플릿 파서 ───────────────────────────────────────── */

    private List<TransactionDto> parseTemplateFormat(Workbook wb) {
        Sheet sheet = wb.getSheetAt(0);
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) throw new IllegalArgumentException("엑셀 헤더가 없습니다.");

        Map<String, Integer> ci = buildColIndex(headerRow);
        List<String> missing = new ArrayList<>();
        for (String h : HEADERS) if (!ci.containsKey(h)) missing.add(h);
        if (!missing.isEmpty()) throw new IllegalArgumentException("컬럼 누락: " + String.join(", ", missing));

        List<TransactionDto> result = new ArrayList<>();
        long tempId = 1;

        for (int r = 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String date = getCellString(row, ci.get("날짜"));
            if (date.isBlank()) continue;

            String merchant    = getCellString(row, ci.get("가맹점명"));
            String category    = getCellString(row, ci.get("카테고리"));
            long   amount      = getCellLong(row,   ci.get("금액"));
            String card        = getCellString(row, ci.get("카드명"));
            int    installment = (int) getCellLong(row, ci.get("할부개월"));
            String status      = getCellString(row, ci.get("상태"));

            if (!date.matches("\\d{4}-\\d{2}-\\d{2}"))
                throw new IllegalArgumentException((r + 1) + "행: 날짜 형식 오류 (YYYY-MM-DD)");
            if (!VALID_CATEGORIES.contains(category))
                throw new IllegalArgumentException((r + 1) + "행: 유효하지 않은 카테고리 '" + category + "'");
            if (!VALID_STATUSES.contains(status))
                throw new IllegalArgumentException((r + 1) + "행: 상태는 '승인' 또는 '취소'여야 합니다.");

            result.add(TransactionDto.builder()
                    .id(tempId++).date(date).merchant(merchant).category(category)
                    .amount(amount).card(card)
                    .installment(installment == 0 ? 1 : installment)
                    .status(status).build());
        }
        return result;
    }

    /* ── 공개 메서드 ────────────────────────────────────────────── */

    public List<TransactionDto> parseUpload(MultipartFile file) throws IOException {
        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            BankType bankType = detectBankType(wb);
            return switch (bankType) {
                case SHINHAN  -> parseShinhancardFormat(wb);
                case KB       -> parseKbFormat(wb);
                case TEMPLATE -> parseTemplateFormat(wb);
                case UNKNOWN  -> throw new IllegalArgumentException(
                        "지원하지 않는 엑셀 형식입니다. 신한카드 / KB국민카드 / 서비스 양식 파일만 업로드 가능합니다.");
            };
        }
    }

    public byte[] generateTemplate() throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("카드이용내역");
            CellStyle headerStyle = createHeaderStyle(wb);
            CellStyle sampleStyle = createSampleStyle(wb);

            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            Object[][] sampleRows = {
                    {"2026-04-01", "스타벅스",    "식음료",   6500L,   "신한카드", 1,  "승인"},
                    {"2026-04-02", "쿠팡",        "쇼핑",     38900L,  "국민카드", 1,  "승인"},
                    {"2026-04-03", "카카오택시",  "교통",     8700L,   "삼성카드", 1,  "승인"},
                    {"2026-04-04", "세브란스병원","의료/건강", 35000L,  "국민카드", 1,  "승인"},
                    {"2026-04-05", "CGV",         "문화/여가", 14000L,  "신한카드", 1,  "승인"},
                    {"2026-04-06", "GS25",        "편의점",   4200L,   "삼성카드", 1,  "승인"},
                    {"2026-04-07", "SK에너지",    "주유",     89000L,  "우리카드", 1,  "승인"},
                    {"2026-04-08", "SKT",         "통신",     55000L,  "신한카드", 1,  "승인"},
                    {"2026-04-09", "인프런",      "교육",     39000L,  "삼성카드", 1,  "승인"},
                    {"2026-04-10", "기타가맹점",  "기타",     12000L,  "현대카드", 1,  "승인"},
                    {"2026-04-11", "롯데백화점",  "쇼핑",    235000L,  "현대카드", 6,  "승인"},
                    {"2026-04-12", "배달의민족",  "식음료",   24500L,  "삼성카드", 1,  "승인"},
                    {"2026-04-13", "티머니",      "교통",     50000L,  "우리카드", 1,  "승인"},
                    {"2026-04-14", "맥도날드",    "식음료",   8700L,   "신한카드", 1,  "취소"},
                    {"2026-04-15", "무신사",      "쇼핑",    128000L,  "국민카드", 3,  "승인"},
            };
            for (int r = 0; r < sampleRows.length; r++) {
                Row row = sheet.createRow(r + 1);
                for (int c = 0; c < sampleRows[r].length; c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellStyle(sampleStyle);
                    Object val = sampleRows[r][c];
                    if (val instanceof Number) cell.setCellValue(((Number) val).doubleValue());
                    else cell.setCellValue(val.toString());
                }
            }

            int[] colWidths = {3500, 5000, 3500, 3000, 3500, 3000, 2500};
            for (int i = 0; i < colWidths.length; i++) sheet.setColumnWidth(i, colWidths[i]);
            wb.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportToExcel(List<TransactionDto> transactions) throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("카드이용내역");
            CellStyle headerStyle = createHeaderStyle(wb);
            CellStyle dataStyle   = createDataStyle(wb);
            CellStyle amountStyle = createAmountStyle(wb);

            Row header = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            for (int r = 0; r < transactions.size(); r++) {
                TransactionDto t = transactions.get(r);
                Row row = sheet.createRow(r + 1);
                setCell(row, 0, t.getDate(),     dataStyle);
                setCell(row, 1, t.getMerchant(), dataStyle);
                setCell(row, 2, t.getCategory(), dataStyle);
                Cell amt = row.createCell(3);
                amt.setCellValue(t.getAmount()); amt.setCellStyle(amountStyle);
                setCell(row, 4, t.getCard(), dataStyle);
                Cell inst = row.createCell(5);
                inst.setCellValue(t.getInstallment()); inst.setCellStyle(dataStyle);
                setCell(row, 6, t.getStatus(), dataStyle);
            }

            int[] colWidths = {3500, 5000, 3500, 3500, 3500, 3000, 2500};
            for (int i = 0; i < colWidths.length; i++) sheet.setColumnWidth(i, colWidths[i]);
            wb.write(out);
            return out.toByteArray();
        }
    }

    /* ── 유틸 ───────────────────────────────────────────────────── */

    private Row findHeaderRow(Sheet sheet, String markerColumn) {
        for (int r = 0; r <= Math.min(10, sheet.getLastRowNum()); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;
            for (int c = 0; c < row.getLastCellNum(); c++) {
                if (getCellString(row, c).contains(markerColumn)) return row;
            }
        }
        return null;
    }

    private Map<String, Integer> buildColIndex(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();
        for (int c = 0; c < headerRow.getLastCellNum(); c++) {
            String key = getCellString(headerRow, c).replaceAll("\\s+", "").replaceAll("\n", "");
            if (!key.isBlank()) map.put(key, c);
        }
        return map;
    }

    private String getCellString(Row row, int colIdx) {
        if (colIdx < 0) return "";
        Cell cell = row.getCell(colIdx);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? new SimpleDateFormat("yyyy-MM-dd").format(cell.getDateCellValue())
                    : String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private long getCellLong(Row row, int colIdx) {
        if (colIdx < 0) return 0L;
        Cell cell = row.getCell(colIdx);
        if (cell == null) return 0L;
        return switch (cell.getCellType()) {
            case NUMERIC -> (long) cell.getNumericCellValue();
            case STRING  -> { try { yield Long.parseLong(cell.getStringCellValue().trim().replaceAll("[,\\s]", "")); } catch (NumberFormatException e) { yield 0L; } }
            default -> 0L;
        };
    }

    private void setCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont(); f.setBold(true); f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN);
        return s;
    }

    private CellStyle createDataStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setBorderBottom(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);   s.setBorderRight(BorderStyle.THIN);
        s.setBottomBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        return s;
    }

    private CellStyle createAmountStyle(Workbook wb) {
        CellStyle s = createDataStyle(wb);
        s.setDataFormat(wb.createDataFormat().getFormat("#,##0"));
        s.setAlignment(HorizontalAlignment.RIGHT);
        return s;
    }

    private CellStyle createSampleStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setBorderBottom(BorderStyle.THIN);
        return s;
    }
}
