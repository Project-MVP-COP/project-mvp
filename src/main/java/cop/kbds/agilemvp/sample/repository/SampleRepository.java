package cop.kbds.agilemvp.sample.repository;

import java.util.List;
import cop.kbds.agilemvp.sample.service.SampleVO;

public interface SampleRepository {
    List<SampleVO> getHelloMessages();
}
