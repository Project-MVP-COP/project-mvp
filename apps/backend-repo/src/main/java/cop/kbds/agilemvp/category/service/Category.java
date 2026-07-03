package cop.kbds.agilemvp.category.service;

import cop.kbds.agilemvp.category.exception.CategoryErrorCode;
import cop.kbds.agilemvp.common.exception.BusinessException;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Setter(AccessLevel.PRIVATE)
    private Long id;
    private String name;
    private String color;
    private Integer displayOrder;
    private Boolean isDefault;

    public static Category create(String name, String color) {
        return Category.builder()
                .name(name)
                .color(color)
                .isDefault(false)
                .build();
    }

    public Category update(String name, String color) {
        return Category.builder()
                .id(this.id)
                .name(name)
                .color(color)
                .displayOrder(this.displayOrder)
                .isDefault(this.isDefault)
                .build();
    }

    public void validateDeletion() {
        if (Boolean.TRUE.equals(this.isDefault))
            throw new BusinessException(CategoryErrorCode.DEFAULT_CATEGORY_CANNOT_BE_DELETED);
    }

    public void validateModification() {
        if (Boolean.TRUE.equals(this.isDefault))
            throw new BusinessException(CategoryErrorCode.DEFAULT_CATEGORY_CANNOT_BE_MODIFIED);
    }

    public Category(Long id, String name, String color, Integer displayOrder, Boolean isDefault) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.displayOrder = displayOrder;
        this.isDefault = isDefault;
    }
}
