package cop.kbds.agilemvp.category.service;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder(access = AccessLevel.PRIVATE)
public class Category {
    private final Long    id;
    private final String  name;
    private final String  color;
    private final Integer displayOrder;
    private final Boolean isDefault;

    public static Category create(String name, String color, Integer displayOrder, Boolean isDefault) {
        return Category.builder()
                .name(name)
                .color(color)
                .displayOrder(displayOrder)
                .isDefault(isDefault)
                .build();
    }
}
