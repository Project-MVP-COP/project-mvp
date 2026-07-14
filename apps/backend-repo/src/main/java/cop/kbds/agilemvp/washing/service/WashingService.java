package cop.kbds.agilemvp.washing.service;

import cop.kbds.agilemvp.category.service.Category;
import cop.kbds.agilemvp.category.service.CategoryService;
import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.common.exception.CommonErrorCode;
import cop.kbds.agilemvp.transaction.controller.TransactionDto;
import cop.kbds.agilemvp.transaction.service.TransactionService;
import cop.kbds.agilemvp.washing.controller.WashingOverviewResponse;
import cop.kbds.agilemvp.washing.controller.WashingTransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WashingService {

    private final TransactionService transactionService;
    private final CategoryService categoryService;

    @Transactional(readOnly = true)
    public WashingOverviewResponse getOverview(Long userId) {
        return buildOverview(userId);
    }

    @Transactional
    public WashingOverviewResponse bulkClassify(List<Long> ids, String categoryName, Long userId) {
        Long categoryId = findCategoryIdByName(categoryName, userId);
        for (Long id : ids) {
            transactionService.patchCategory(id, categoryId, userId);
        }
        return buildOverview(userId);
    }

    @Transactional
    public WashingOverviewResponse importMock(Long userId) {
        LocalDate today = LocalDate.now();
        List<TransactionDto> items = List.of(
                TransactionDto.builder()
                        .transactionDate(today.toString())
                        .merchant("메가MGC커피")
                        .amount(3900L)
                        .cardName("현대 Zero")
                        .installment(1)
                        .status("승인")
                        .memo("출근길 커피")
                        .build(),
                TransactionDto.builder()
                        .transactionDate(today.toString())
                        .merchant("오늘의집")
                        .amount(78200L)
                        .cardName("토스뱅크")
                        .installment(1)
                        .status("승인")
                        .memo("소형 가구 결제")
                        .build()
        );
        transactionService.addBulk(items, userId);
        return buildOverview(userId);
    }

    @Transactional
    public WashingTransactionResponse patchCategory(Long id, String categoryName, Long userId) {
        Long categoryId = findCategoryIdByName(categoryName, userId);
        return WashingTransactionResponse.from(transactionService.patchCategory(id, categoryId, userId));
    }

    private WashingOverviewResponse buildOverview(Long userId) {
        List<String> categories = categoryService.findAll(userId).stream()
                .map(Category::getName)
                .toList();
        List<TransactionDto> transactions = transactionService.findAll(userId);
        String lastImportedAt = transactions.stream()
                .map(TransactionDto::getTransactionDate)
                .filter(date -> date != null && !date.isBlank())
                .max(Comparator.naturalOrder())
                .orElse(LocalDate.now().toString());
        return new WashingOverviewResponse(
                categories,
                transactions.stream().map(WashingTransactionResponse::from).toList(),
                lastImportedAt
        );
    }

    private Long findCategoryIdByName(String categoryName, Long userId) {
        if (categoryName == null || categoryName.isBlank()) {
            throw new BusinessException(CommonErrorCode.INVALID_INPUT_VALUE);
        }
        return categoryService.findAll(userId).stream()
                .filter(category -> category.getName().equals(categoryName))
                .findFirst()
                .map(Category::getId)
                .orElseThrow(() -> new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND));
    }
}
