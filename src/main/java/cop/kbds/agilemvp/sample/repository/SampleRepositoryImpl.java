package cop.kbds.agilemvp.sample.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;

import cop.kbds.agilemvp.sample.service.SampleVO;

@Repository
@RequiredArgsConstructor
public class SampleRepositoryImpl implements SampleRepository {

    private final SampleMapper sampleMapper;

    @Override
    public List<SampleVO> getHelloMessages() {
        return sampleMapper.getHelloMessages();
    }
}
