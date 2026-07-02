package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.service.Category;

import java.util.List;

public interface CategoryRepository {
    List<Category> findAllAvailable(Long userId);
    Category findByIdAvailable(Long id, Long userId);
    Category findByNameAvailable(String name, Long userId);
    void save(Category category);
    int update(Category category);
    int detachTransactionsByCategoryId(Long id);
    void deleteById(Long id);
}
