package cop.kbds.agilemvp.insight.config;

import java.time.Duration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;

@Slf4j
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(BedrockProperties.class)
public class BedrockConfiguration {

    @Bean
    @ConditionalOnMissingBean(ObjectMapper.class)
    @ConditionalOnProperty(prefix = "bedrock", name = "enabled", havingValue = "true")
    ObjectMapper bedrockObjectMapper() {
        return new ObjectMapper().findAndRegisterModules();
    }

    @Bean
    @ConditionalOnProperty(prefix = "bedrock", name = "enabled", havingValue = "true")
    BedrockRuntimeClient bedrockRuntimeClient(BedrockProperties properties) {
        validate(properties);

        Duration timeout = properties.apiCallTimeout();
        log.info("Configuring Bedrock runtime: region={}, modelId={}, attemptTimeoutMs={}",
                properties.region(), properties.modelId(), timeout.toMillis());
        ClientOverrideConfiguration overrideConfiguration = ClientOverrideConfiguration.builder()
                .apiCallAttemptTimeout(timeout)
                .apiCallTimeout(timeout.plusSeconds(5))
                .build();

        return BedrockRuntimeClient.builder()
                .region(Region.of(properties.region()))
                .credentialsProvider(DefaultCredentialsProvider.builder().build())
                .overrideConfiguration(overrideConfiguration)
                .build();
    }

    private void validate(BedrockProperties properties) {
        if (properties.region() == null || properties.region().isBlank()) {
            throw new IllegalStateException("BEDROCK_REGION must be configured when Bedrock is enabled.");
        }
        if (properties.modelId() == null || properties.modelId().isBlank()) {
            throw new IllegalStateException("BEDROCK_MODEL_ID must be configured when Bedrock is enabled.");
        }
        if (properties.maxTokens() == null || properties.maxTokens() <= 0) {
            throw new IllegalStateException("BEDROCK_MAX_TOKENS must be greater than zero.");
        }
        if (properties.temperature() == null
                || properties.temperature() < 0.0f
                || properties.temperature() > 1.0f) {
            throw new IllegalStateException("BEDROCK_TEMPERATURE must be between 0 and 1.");
        }
        if (properties.apiCallTimeout() == null || properties.apiCallTimeout().isNegative()
                || properties.apiCallTimeout().isZero()) {
            throw new IllegalStateException("BEDROCK_API_CALL_TIMEOUT must be greater than zero.");
        }
    }
}
