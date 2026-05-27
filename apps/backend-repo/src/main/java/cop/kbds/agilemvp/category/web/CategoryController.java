package cop.kbds.agilemvp.category.web;

import cop.kbds.agilemvp.category.infra.CategoryMapper;
import cop.kbds.agilemvp.category.service.Category;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryMapper categoryMapper;

    public CategoryController(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    @GetMapping
    public List<Category> findAll() {
        return categoryMapper.findAll();
    }
}
