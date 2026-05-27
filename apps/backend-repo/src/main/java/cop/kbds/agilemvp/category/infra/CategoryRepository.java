package cop.kbds.agilemvp.category.infra;

import cop.kbds.agilemvp.category.service.Category;

import java.util.List;

public interface CategoryRepository {
    List<Category> findAll();
    Category findByName(String name);
}
