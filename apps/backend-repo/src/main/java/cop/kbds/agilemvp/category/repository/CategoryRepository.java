package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.service.Category;

import java.util.List;

public interface CategoryRepository {
    List<Category> findAll();
    Category findById(Long id);
    Category findByName(String name);
    void save(Category category);
    int update(Category category);
    int detachTransactionsByCategoryId(Long id);
    void deleteById(Long id);
}
