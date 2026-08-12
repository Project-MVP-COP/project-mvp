package cop.kbds.agilemvp.insight.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cop.kbds.agilemvp.insight.service.InsightService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "insight", description = "AI 소비 인사이트 API")
@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightController {

    private final InsightService insightService;

    @PostMapping
    public InsightResponse generate(@RequestBody @Valid InsightRequest request) {
        return InsightResponse.from(insightService.generate(request.toCommand()));
    }
}
