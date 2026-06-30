package cop.kbds.agilemvp.rule.service;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.common.util.TagUtil;
import cop.kbds.agilemvp.rule.exception.RuleErrorCode;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Rule {

    @Setter(AccessLevel.PRIVATE)
    private Long id;
    private Long userId;
    private String keyword;
    private Long categoryId;
    private String categoryName;
    private String tag;
    private Integer appliedCount;

    public static Rule create(Long userId, String keyword, Long categoryId, String tag) {
        validate(keyword);
        String normalizedKeyword = keyword.trim();
        String normalizedTag = TagUtil.normalize(tag);
        return Rule.builder()
                .userId(userId)
                .keyword(normalizedKeyword)
                .categoryId(categoryId)
                .tag(normalizedTag)
                .build();
    }

    public Rule(Long id, Long userId, String keyword, Long categoryId, String categoryName, String tag, Integer appliedCount) {
        this.id = id;
        this.userId = userId;
        this.keyword = keyword;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.tag = tag;
        this.appliedCount = appliedCount;
    }

    private static void validate(String keyword) {
        if (keyword == null || keyword.isBlank())
            throw new BusinessException(RuleErrorCode.INVALID_KEYWORD);
        if (keyword.trim().length() > 100)
            throw new BusinessException(RuleErrorCode.INVALID_KEYWORD);
    }
}
