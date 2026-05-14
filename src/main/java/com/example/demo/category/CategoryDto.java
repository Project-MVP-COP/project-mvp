package com.example.demo.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long    id;
    private String  name;
    private String  color;
    private Integer displayOrder;
    private Boolean isDefault;
}
