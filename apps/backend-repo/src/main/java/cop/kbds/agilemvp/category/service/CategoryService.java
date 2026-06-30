package cop.kbds.agilemvp.category.service;

import cop.kbds.agilemvp.category.exception.CategoryErrorCode;
import cop.kbds.agilemvp.category.repository.CategoryRepository;
import cop.kbds.agilemvp.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    @Transactional
    public void create(String name, String color) {
        Category category = Category.create(name, color);
        try {
            categoryRepository.save(category);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(CategoryErrorCode.DUPLICATE_CATEGORY_NAME);
        }
    }

    @Transactional
    public Category update(Long id, String name, String color) {
        Category category = findOrThrow(id);
        category.validateModification();
        Category updated = category.update(name, color);
        try {
            int affected = categoryRepository.update(updated);
            if (affected == 0) throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(CategoryErrorCode.DUPLICATE_CATEGORY_NAME);
        }
        return updated;
    }

    @Transactional
    public void delete(Long id) {
        Category category = findOrThrow(id);
        category.validateDeletion();
        categoryRepository.deleteById(id);
    }

    private Category findOrThrow(Long id) {
        Category category = categoryRepository.findById(id);
        if (category == null) throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
        return category;
    }
}
