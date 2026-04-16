package cop.kbds.agilemvp.sample.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import cop.kbds.agilemvp.sample.service.SampleService;

@RestController
@RequestMapping("/api/sample")
@RequiredArgsConstructor
public class SampleController {

    private final SampleService sampleService;

    @GetMapping("/hello")
    public List<SampleResponse> getHelloMessages(SampleRequest request) {
        return sampleService.getHelloMessages(request);
    }
}
