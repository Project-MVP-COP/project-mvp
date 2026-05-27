package cop.kbds.agilemvp.category.infra;

import cop.kbds.agilemvp.category.service.Category;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CategoryMapper {
    List<Category> findAll();
    Category findByName(String name);
}
