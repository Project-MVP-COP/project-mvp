package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.service.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryMapper {
    List<Category> findAll();
    Category findById(@Param("id") Long id);
    Category findByName(@Param("name") String name);
    void insert(Category category);
    void update(Category category);
    void deleteById(@Param("id") Long id);
}
