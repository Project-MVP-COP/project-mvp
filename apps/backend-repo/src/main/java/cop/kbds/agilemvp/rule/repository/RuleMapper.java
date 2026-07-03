package cop.kbds.agilemvp.rule.repository;

import cop.kbds.agilemvp.rule.service.MatchedTransactionDto;
import cop.kbds.agilemvp.rule.service.Rule;
import cop.kbds.agilemvp.rule.service.RulePattern;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RuleMapper {
    List<Rule> findAllByUserId(@Param("userId") Long userId);
    Rule findById(@Param("id") Long id);
    boolean existsByUserIdAndKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
    void insert(Rule rule);
    void deleteById(@Param("id") Long id);
    int applyRuleToTransactions(@Param("userId") Long userId, @Param("keyword") String keyword,
                                  @Param("categoryId") Long categoryId, @Param("tag") String tag);
    int countMatchedTransactions(@Param("userId") Long userId, @Param("keyword") String keyword);
    List<MatchedTransactionDto> findMatchedTransactions(@Param("userId") Long userId,
                                                        @Param("keyword") String keyword);
    List<RulePattern> findUnclassifiedPatterns(@Param("userId") Long userId);
}
