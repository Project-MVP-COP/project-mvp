package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.controller.CategoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CategoryRepositoryImpl implements CategoryRepository {
    private final CategoryMapper categoryMapper;

    @Override public List<CategoryDto> findAll()                   { return categoryMapper.findAll(); }
    @Override public CategoryDto       findByName(String name)     { return categoryMapper.findByName(name); }
}
