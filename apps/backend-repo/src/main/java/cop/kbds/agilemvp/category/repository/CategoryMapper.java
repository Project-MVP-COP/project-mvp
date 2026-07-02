package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.service.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryMapper {
    List<Category> findAllAvailable(@Param("userId") Long userId);
    Category findByIdAvailable(@Param("id") Long id, @Param("userId") Long userId);
    Category findByNameAvailable(@Param("name") String name, @Param("userId") Long userId);
    Category findByNameOwned(@Param("name") String name, @Param("userId") Long userId);
    void insert(Category category);
    int update(Category category);
    int detachTransactionsByCategoryId(@Param("id") Long id);
    int deleteById(@Param("id") Long id, @Param("userId") Long userId);
}
