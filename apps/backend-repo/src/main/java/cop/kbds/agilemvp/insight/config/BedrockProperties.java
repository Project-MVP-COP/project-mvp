package cop.kbds.agilemvp.insight.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "bedrock")
public record BedrockProperties(
        boolean enabled,
        String region,
        String modelId,
        Integer maxTokens,
        Float temperature,
        Duration apiCallTimeout
) {}
