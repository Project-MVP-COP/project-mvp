package cop.kbds.agilemvp.category.service;

import cop.kbds.agilemvp.category.exception.CategoryErrorCode;
import cop.kbds.agilemvp.category.repository.CategoryRepository;
import cop.kbds.agilemvp.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> findAll(Long userId) {
        return categoryRepository.findAllAvailable(userId);
    }

    @Transactional
    public void create(Long userId, String name, String color) {
        Category category = Category.create(userId, name, color);
        if (categoryRepository.findByNameOwned(category.getName(), userId) != null) {
            throw new BusinessException(CategoryErrorCode.DUPLICATE_CATEGORY_NAME);
        }
        try {
            categoryRepository.save(category);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(CategoryErrorCode.DUPLICATE_CATEGORY_NAME);
        }
    }

    @Transactional
    public Category update(Long id, Long userId, String name, String color) {
        Category category = findOrThrow(id, userId);
        category.validateModification();
        Category updated = category.update(name, color);
        Category duplicate = categoryRepository.findByNameOwned(updated.getName(), userId);
        if (duplicate != null && !duplicate.getId().equals(id)) {
            throw new BusinessException(CategoryErrorCode.DUPLICATE_CATEGORY_NAME);
        }
        try {
            int affected = categoryRepository.update(updated);
            if (affected == 0) throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(CategoryErrorCode.DUPLICATE_CATEGORY_NAME);
        }
        return updated;
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Category category = findOrThrow(id, userId);
        category.validateDeletion();
        try {
            categoryRepository.detachTransactionsByCategoryId(id);
            int affected = categoryRepository.deleteById(id, userId);
            if (affected == 0) throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException(CategoryErrorCode.CATEGORY_IN_USE);
        }
    }

    private Category findOrThrow(Long id, Long userId) {
        Category category = categoryRepository.findByIdAvailable(id, userId);
        if (category == null) throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
        return category;
    }
}
