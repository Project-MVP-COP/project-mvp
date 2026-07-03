package cop.kbds.agilemvp.category.controller;

import cop.kbds.agilemvp.category.service.Category;

public record CategoryResponse(
        Long id,
        Long userId,
        String name,
        String color,
        Integer displayOrder,
        Boolean isDefault
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getUserId(),
                category.getName(),
                category.getColor(),
                category.getDisplayOrder(),
                category.getIsDefault()
        );
    }
}
