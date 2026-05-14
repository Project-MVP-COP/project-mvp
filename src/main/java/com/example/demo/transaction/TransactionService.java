package com.example.demo.transaction;

import com.example.demo.category.CategoryMapper;
import com.example.demo.excel.dto.TransactionDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    private static final Long DUMMY_USER_ID = 1L;

    private final TransactionMapper mapper;
    private final CategoryMapper    categoryMapper;

    public TransactionService(TransactionMapper mapper, CategoryMapper categoryMapper) {
        this.mapper         = mapper;
        this.categoryMapper = categoryMapper;
    }

    public List<TransactionDto> findAll() {
        return mapper.findAll();
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

    public TransactionDto add(TransactionDto dto) {
        dto.setUserId(DUMMY_USER_ID);
        resolveCategoryId(dto);
        mapper.insert(dto);
        return dto;
    }

    public List<TransactionDto> addBulk(List<TransactionDto> list) {
        Map<String, Long> catMap = buildCategoryMap();
        List<TransactionDto> added = new ArrayList<>();
        for (TransactionDto dto : list) {
            dto.setUserId(DUMMY_USER_ID);
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
        if (existing == null) throw new IllegalArgumentException("ID not found: " + id);
        dto.setId(id);
        dto.setUserId(existing.getUserId());
        resolveCategoryId(dto);
        mapper.update(dto);
        return dto;
    }

    public void delete(Long id) {
        mapper.delete(id);
    }

    public void deleteAll() {
        mapper.deleteAll();
    }

    public List<TransactionDto> reset() {
        mapper.deleteAll();
        insertDefaults();
        return mapper.findAll();
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

    private void insertDefaults() {
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
            {"2026-01-13","세브란스병원","의료/건강",45000L,"국민카드",1,"승인"},
            {"2026-01-14","GS25","편의점",4700L,"삼성카드",1,"승인"},
            {"2026-01-15","CGV","문화/여가",14000L,"신한카드",1,"승인"},
            {"2026-01-16","KTX","교통",53000L,"현대카드",1,"승인"},
            {"2026-01-17","무신사","쇼핑",128000L,"국민카드",3,"승인"},
            {"2026-01-18","스타벅스","식음료",13500L,"신한카드",1,"승인"},
            {"2026-01-20","클래스101","교육",39000L,"삼성카드",1,"승인"},
            {"2026-01-21","GS칼텍스","주유",76000L,"우리카드",1,"승인"},
            {"2026-01-22","쿠팡이츠","식음료",18900L,"신한카드",1,"승인"},
            {"2026-01-23","유튜브프리미엄","문화/여가",14900L,"현대카드",1,"승인"},
            {"2026-01-24","세븐일레븐","편의점",5600L,"국민카드",1,"승인"},
            {"2026-01-25","롯데백화점","쇼핑",235000L,"현대카드",6,"승인"},
            {"2026-01-26","티머니","교통",50000L,"우리카드",1,"승인"},
            {"2026-01-27","올리브영","쇼핑",43500L,"신한카드",1,"승인"},
            {"2026-01-28","인프런","교육",59000L,"삼성카드",1,"승인"},
            {"2026-01-29","맥도날드","식음료",8700L,"신한카드",1,"취소"},
            {"2026-01-30","KT","통신",49000L,"국민카드",1,"승인"},
            {"2026-01-31","네이버쇼핑","쇼핑",52000L,"현대카드",2,"승인"},
            {"2026-02-01","스타벅스","식음료",7500L,"신한카드",1,"승인"},
            {"2026-02-02","배달의민족","식음료",31000L,"삼성카드",1,"승인"},
            {"2026-02-03","카카오택시","교통",8900L,"삼성카드",1,"승인"},
            {"2026-02-05","이마트","쇼핑",92000L,"현대카드",1,"승인"},
            {"2026-02-06","CGV","문화/여가",28000L,"신한카드",1,"승인"},
            {"2026-02-07","SK에너지","주유",95000L,"우리카드",1,"승인"},
            {"2026-02-08","LG U+","통신",62000L,"삼성카드",1,"승인"},
            {"2026-02-10","쿠팡","쇼핑",145000L,"국민카드",3,"승인"},
            {"2026-02-11","스타벅스","식음료",12000L,"신한카드",1,"승인"},
            {"2026-02-12","세브란스병원","의료/건강",35000L,"국민카드",1,"승인"},
            {"2026-02-13","GS25","편의점",6100L,"삼성카드",1,"승인"},
            {"2026-02-14","롯데백화점","쇼핑",198000L,"현대카드",6,"승인"},
            {"2026-02-15","넷플릭스","문화/여가",17000L,"국민카드",1,"승인"},
            {"2026-02-16","쿠팡이츠","식음료",22400L,"신한카드",1,"승인"},
            {"2026-02-17","인프런","교육",49000L,"삼성카드",1,"승인"},
            {"2026-02-18","GS칼텍스","주유",82000L,"우리카드",1,"승인"},
            {"2026-02-20","CU","편의점",4200L,"현대카드",1,"승인"},
            {"2026-02-21","KTX","교통",65000L,"현대카드",1,"승인"},
            {"2026-02-22","올리브영약국","의료/건강",28000L,"신한카드",1,"승인"},
            {"2026-02-23","무신사","쇼핑",78000L,"국민카드",2,"승인"},
            {"2026-02-24","유튜브프리미엄","문화/여가",14900L,"현대카드",1,"승인"},
            {"2026-02-25","세븐일레븐","편의점",3800L,"국민카드",1,"승인"},
            {"2026-02-26","네이버쇼핑","쇼핑",34500L,"현대카드",1,"승인"},
            {"2026-02-27","SKT","통신",55000L,"신한카드",1,"승인"},
            {"2026-02-28","배달의민족","식음료",28700L,"삼성카드",1,"취소"},
            {"2026-03-01","스타벅스","식음료",9000L,"신한카드",1,"승인"},
            {"2026-03-02","카카오택시","교통",15700L,"삼성카드",1,"승인"},
            {"2026-03-03","쿠팡","쇼핑",234000L,"국민카드",6,"승인"},
            {"2026-03-04","맥도날드","식음료",11200L,"신한카드",1,"승인"},
            {"2026-03-05","SK에너지","주유",102000L,"우리카드",1,"승인"},
            {"2026-03-06","세브란스병원","의료/건강",67000L,"국민카드",1,"승인"},
            {"2026-03-07","GS25","편의점",5100L,"삼성카드",1,"승인"},
            {"2026-03-08","넷플릭스","문화/여가",17000L,"국민카드",1,"승인"},
            {"2026-03-09","배달의민족","식음료",35600L,"삼성카드",1,"승인"},
            {"2026-03-10","이마트","쇼핑",118000L,"현대카드",1,"승인"},
            {"2026-03-11","GS칼텍스","주유",88000L,"우리카드",1,"승인"},
            {"2026-03-12","CGV","문화/여가",21000L,"신한카드",1,"승인"},
            {"2026-03-13","클래스101","교육",49000L,"삼성카드",1,"승인"},
            {"2026-03-14","CU","편의점",6200L,"현대카드",1,"승인"},
            {"2026-03-15","KTX","교통",73000L,"현대카드",1,"승인"},
            {"2026-03-16","올리브영","쇼핑",56000L,"신한카드",1,"승인"},
            {"2026-03-17","스타벅스","식음료",8500L,"신한카드",1,"승인"},
            {"2026-03-18","쿠팡이츠","식음료",19800L,"신한카드",1,"승인"},
            {"2026-03-19","무신사","쇼핑",165000L,"국민카드",3,"승인"},
            {"2026-03-20","유튜브프리미엄","문화/여가",14900L,"현대카드",1,"승인"},
            {"2026-03-21","세븐일레븐","편의점",4100L,"국민카드",1,"승인"},
            {"2026-03-22","KT","통신",49000L,"국민카드",1,"승인"},
            {"2026-03-23","롯데백화점","쇼핑",312000L,"현대카드",6,"승인"},
            {"2026-03-24","인프런","교육",79000L,"삼성카드",1,"승인"},
            {"2026-03-25","티머니","교통",50000L,"우리카드",1,"승인"},
            {"2026-03-26","세브란스병원","의료/건강",32000L,"국민카드",1,"승인"},
            {"2026-03-27","배달의민족","식음료",27300L,"삼성카드",1,"취소"},
            {"2026-03-28","KTX","교통",71000L,"현대카드",1,"승인"},
            {"2026-03-29","네이버쇼핑","쇼핑",45000L,"현대카드",2,"취소"},
            {"2026-03-30","맥도날드","식음료",8200L,"신한카드",1,"승인"},
        };
        for (Object[] r : rows) {
            mapper.insert(TransactionDto.builder()
                .userId(DUMMY_USER_ID)
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
