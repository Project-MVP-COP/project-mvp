package com.example.demo.transaction;

import com.example.demo.excel.dto.TransactionDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TransactionMapper {

    List<TransactionDto> findAll(@Param("userId") Long userId);

    List<TransactionDto> searchList(TransactionSearchDto params);

    TransactionSummaryDto searchSummary(TransactionSearchDto params);

    TransactionDto findById(@Param("id") Long id);

    void insert(TransactionDto dto);

    void update(TransactionDto dto);

    void delete(@Param("id") Long id);

    void deleteAll(@Param("userId") Long userId);

}
