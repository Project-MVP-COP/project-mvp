package cop.kbds.agilemvp.category.controller;

import cop.kbds.agilemvp.category.service.Category;

public record CategoryResponse(
        Long    id,
        String  name,
        String  color,
        Integer displayOrder,
        Boolean isDefault
) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(
                c.getId(), c.getName(), c.getColor(),
                c.getDisplayOrder(), c.getIsDefault()
        );
    }
}
