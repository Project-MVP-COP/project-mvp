package cop.kbds.agilemvp.excel;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.ConfigurationPropertySources;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.boot.servlet.autoconfigure.MultipartProperties;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.unit.DataSize;

class ExcelUploadConfigurationTest {

    @Test
    @DisplayName("엑셀 업로드는 파일 10MB와 요청 12MB까지 허용한다")
    void bindsConfiguredMultipartLimits() throws IOException {
        var propertySources = new YamlPropertySourceLoader()
                .load("application.yml", new ClassPathResource("application.yml"));
        var multipartProperties = new Binder(ConfigurationPropertySources.from(propertySources))
                .bind("spring.servlet.multipart", Bindable.of(MultipartProperties.class))
                .orElseThrow(() -> new AssertionError("multipart configuration is missing"));

        assertThat(multipartProperties.getMaxFileSize()).isEqualTo(DataSize.ofMegabytes(10));
        assertThat(multipartProperties.getMaxRequestSize()).isEqualTo(DataSize.ofMegabytes(12));
    }
}
