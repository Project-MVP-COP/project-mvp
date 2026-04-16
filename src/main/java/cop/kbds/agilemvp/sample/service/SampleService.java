package cop.kbds.agilemvp.sample.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import cop.kbds.agilemvp.sample.controller.SampleRequest;
import cop.kbds.agilemvp.sample.controller.SampleResponse;
import cop.kbds.agilemvp.sample.repository.SampleRepository;

@Service
@RequiredArgsConstructor
public class SampleService {

    private final SampleRepository sampleRepository;

    public List<SampleResponse> getHelloMessages(SampleRequest request) {
        String name = (request != null) ? request.name() : null;
        return sampleRepository.getHelloMessages().stream()
                .filter(SampleVO::isValid)
                .map(vo -> SampleResponse.from(vo, name))
                .collect(Collectors.toList());
    }
}
