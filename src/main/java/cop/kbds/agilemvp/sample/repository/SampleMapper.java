package cop.kbds.agilemvp.sample.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import cop.kbds.agilemvp.sample.service.SampleVO;

@Mapper
public interface SampleMapper {
    List<SampleVO> getHelloMessages();
}
