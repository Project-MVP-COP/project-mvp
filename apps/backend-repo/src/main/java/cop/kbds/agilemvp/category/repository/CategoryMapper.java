package cop.kbds.agilemvp.category.repository;

import cop.kbds.agilemvp.category.controller.CategoryDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryMapper {
    List<CategoryDto> findAll();
    CategoryDto findByName(@Param("name") String name);
}
