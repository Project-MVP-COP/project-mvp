package cop.kbds.agilemvp.category.controller;

import cop.kbds.agilemvp.category.service.CategoryService;
import cop.kbds.agilemvp.user.service.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "category", description = "카테고리 API")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public List<CategoryResponse> findAll(@AuthenticationPrincipal User currentUser) {
        return categoryService.findAll(currentUser.getId()).stream().map(CategoryResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@RequestBody @Valid CategoryCreateRequest request,
                       @AuthenticationPrincipal User currentUser) {
        categoryService.create(currentUser.getId(), request.name(), request.color());
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id,
                                   @RequestBody @Valid CategoryUpdateRequest request,
                                   @AuthenticationPrincipal User currentUser) {
        return CategoryResponse.from(categoryService.update(id, currentUser.getId(), request.name(), request.color()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal User currentUser) {
        categoryService.delete(id, currentUser.getId());
    }
}
