package com.example.demo.transaction;

import com.example.demo.category.CategoryMapper;
import com.example.demo.common.exception.BusinessException;
import com.example.demo.common.exception.CommonErrorCode;
import com.example.demo.excel.dto.TransactionDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    private final TransactionMapper mapper;
    private final CategoryMapper    categoryMapper;

    public TransactionService(TransactionMapper mapper, CategoryMapper categoryMapper) {
        this.mapper         = mapper;
        this.categoryMapper = categoryMapper;
    }

    public List<TransactionDto> findAll(Long userId) {
        return mapper.findAll(userId);
    }

    public TransactionPageResult search(TransactionSearchDto params) {
        List<TransactionDto> data = mapper.searchList(params);
        TransactionSummaryDto summary = mapper.searchSummary(params);
        boolean hasMore = data.size() == params.getSize();
        return new TransactionPageResult(
                summary.getTotalCount(),
                summary.getApprovedCount(),
                summary.getCancelledCount(),
                summary.getTotalAmount(),
                hasMore,
                data
        );
    }

    public TransactionSummaryDto summary(TransactionSearchDto params) {
        return mapper.searchSummary(params);
    }

    public TransactionDto findById(Long id) {
        TransactionDto dto = mapper.findById(id);
        if (dto == null) throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND);
        return dto;
    }

    public TransactionDto add(TransactionDto dto, Long userId) {
        dto.setUserId(userId);
        resolveCategoryId(dto);
        mapper.insert(dto);
        return dto;
    }

    public List<TransactionDto> addBulk(List<TransactionDto> list, Long userId) {
        Map<String, Long> catMap = buildCategoryMap();
        List<TransactionDto> added = new ArrayList<>();
        for (TransactionDto dto : list) {
            dto.setUserId(userId);
            if (dto.getCategoryId() == null && dto.getCategoryName() != null) {
                dto.setCategoryId(catMap.getOrDefault(dto.getCategoryName(), catMap.get("기타")));
            }
            if (mapper.existsByKey(dto.getUserId(), dto.getTransactionDate(),
                                   dto.getMerchant(), dto.getAmount(), dto.getCardName())) continue;
            mapper.insert(dto);
            added.add(dto);
        }
        return added;
    }

    public TransactionDto update(Long id, TransactionDto dto) {
        TransactionDto existing = mapper.findById(id);
        if (existing == null) throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND);
        dto.setId(id);
        dto.setUserId(existing.getUserId());
        resolveCategoryId(dto);
        mapper.update(dto);
        return dto;
    }

    public void delete(Long id) {
        mapper.delete(id);
    }

    public void deleteAll(Long userId) {
        mapper.deleteAll(userId);
    }

    public List<TransactionDto> reset(Long userId) {
        mapper.deleteAll(userId);
        insertDefaults(userId);
        return mapper.findAll(userId);
    }

    private void resolveCategoryId(TransactionDto dto) {
        if (dto.getCategoryId() == null && dto.getCategoryName() != null) {
            Map<String, Long> catMap = buildCategoryMap();
            dto.setCategoryId(catMap.getOrDefault(dto.getCategoryName(), catMap.get("기타")));
        }
    }

    private Map<String, Long> buildCategoryMap() {
        Map<String, Long> map = new HashMap<>();
        categoryMapper.findAll().forEach(c -> map.put(c.getName(), c.getId()));
        return map;
    }

    private void insertDefaults(Long userId) {
        Map<String, Long> cat = buildCategoryMap();
        Object[][] rows = {
            {"2026-01-02","스타벅스","식음료",6500L,"신한카드",1,"승인"},
            {"2026-01-03","쿠팡","쇼핑",38900L,"국민카드",1,"승인"},
            {"2026-01-05","카카오택시","교통",12300L,"삼성카드",1,"승인"},
            {"2026-01-06","맥도날드","식음료",9800L,"신한카드",1,"승인"},
            {"2026-01-07","CU","편의점",3200L,"현대카드",1,"승인"},
            {"2026-01-08","넷플릭스","문화/여가",17000L,"국민카드",1,"승인"},
            {"2026-01-09","SKT","통신",55000L,"신한카드",1,"승인"},
            {"2026-01-10","배달의민족","식음료",24500L,"삼성카드",1,"승인"},
            {"2026-01-11","이마트","쇼핑",67300L,"현대카드",1,"승인"},
            {"2026-01-12","SK에너지","주유",89000L,"우리카드",1,"승인"},
        };
        for (Object[] r : rows) {
            mapper.insert(TransactionDto.builder()
                .userId(userId)
                .transactionDate((String)  r[0])
                .merchant(       (String)  r[1])
                .categoryId(cat.getOrDefault((String) r[2], cat.get("기타")))
                .amount(         (Long)    r[3])
                .cardName(       (String)  r[4])
                .installment(    (Integer) r[5])
                .status(         (String)  r[6])
                .build());
        }
    }
}
