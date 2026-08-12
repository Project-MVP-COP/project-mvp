package cop.kbds.agilemvp.insight.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InsightService {

    private final InsightGenerator insightGenerator;

    public InsightResult generate(InsightCommand command) {
        return insightGenerator.generate(command);
    }
}
