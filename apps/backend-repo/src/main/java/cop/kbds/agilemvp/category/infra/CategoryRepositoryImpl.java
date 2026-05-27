package cop.kbds.agilemvp.category.infra;

import cop.kbds.agilemvp.category.service.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CategoryRepositoryImpl implements CategoryRepository {

    private final CategoryMapper categoryMapper;

    @Override
    public List<Category> findAll() {
        return categoryMapper.findAll();
    }

    @Override
    public Category findByName(String name) {
        return categoryMapper.findByName(name);
    }
}
