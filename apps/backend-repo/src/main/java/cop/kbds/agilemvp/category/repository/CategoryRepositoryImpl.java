package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.service.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CategoryRepositoryImpl implements CategoryRepository {
    private final CategoryMapper categoryMapper;

    @Override public List<Category> findAllAvailable(Long userId) { return categoryMapper.findAllAvailable(userId); }
    @Override public Category       findByIdAvailable(Long id, Long userId) { return categoryMapper.findByIdAvailable(id, userId); }
    @Override public Category       findByNameAvailable(String name, Long userId) { return categoryMapper.findByNameAvailable(name, userId); }
    @Override public Category       findByNameOwned(String name, Long userId) { return categoryMapper.findByNameOwned(name, userId); }
    @Override public void           save(Category category)       { categoryMapper.insert(category); }
    @Override public int            update(Category category)     { return categoryMapper.update(category); }
    @Override public int            detachTransactionsByCategoryId(Long id) { return categoryMapper.detachTransactionsByCategoryId(id); }
    @Override public int            deleteById(Long id, Long userId) { return categoryMapper.deleteById(id, userId); }
}
