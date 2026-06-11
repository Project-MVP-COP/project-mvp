package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.controller.CategoryDto;

import java.util.List;

public interface CategoryRepository {
    List<CategoryDto> findAll();
    CategoryDto findByName(String name);
}
