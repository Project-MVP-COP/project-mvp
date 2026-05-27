package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.service.Category;

import java.util.List;

public interface CategoryRepository {
    List<Category> findAll();
    Category findByName(String name);
}
