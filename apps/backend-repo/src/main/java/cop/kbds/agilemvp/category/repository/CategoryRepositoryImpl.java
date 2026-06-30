package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.service.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CategoryRepositoryImpl implements CategoryRepository {
    private final CategoryMapper categoryMapper;

    @Override public List<Category> findAll()                     { return categoryMapper.findAll(); }
    @Override public Category       findById(Long id)             { return categoryMapper.findById(id); }
    @Override public Category       findByName(String name)       { return categoryMapper.findByName(name); }
    @Override public void           save(Category category)       { categoryMapper.insert(category); }
    @Override public void           update(Category category)     { categoryMapper.update(category); }
    @Override public void           deleteById(Long id)           { categoryMapper.deleteById(id); }
}
