package cop.kbds.agilemvp.sample.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.times;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.common.exception.CommonErrorCode;
import cop.kbds.agilemvp.sample.controller.SampleRequest;
import cop.kbds.agilemvp.sample.controller.SampleResponse;
import cop.kbds.agilemvp.sample.repository.SampleRepository;

@ExtendWith(MockitoExtension.class)
class SampleServiceTest {

    @InjectMocks
    private SampleService sampleService;

    @Mock
    private SampleRepository sampleRepository;

    @Test
    @DisplayName("샘플 목록 조회 성공")
    void getHelloMessages_Success() {
        // given
        SampleRequest request = new SampleRequest("홍길동");
        Sample sample = Sample.create("테스트 메세지");
        given(sampleRepository.getHelloMessages()).willReturn(List.of(sample));

        // when
        List<SampleResponse> result = sampleService.getHelloMessages(request);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).message()).contains("홍길동");
        assertThat(result.get(0).message()).contains("테스트 메세지");
        then(sampleRepository).should(times(1)).getHelloMessages();
    }

    @Test
    @DisplayName("샘플 생성 성공")
    void createSample_Success() {
        // given
        String message = "New Sample Message";

        // when
        sampleService.createSample(message);

        // then
        then(sampleRepository).should(times(1)).save(any(Sample.class));
    }

    @Test
    @DisplayName("샘플 수정 성공")
    void updateSample_Success() {
        // given
        Long id = 1L;
        String message = "Updated Message";
        Sample existing = Sample.builder().id(id).message("Old Message").build();
        given(sampleRepository.findById(id)).willReturn(existing);

        // when
        sampleService.updateSample(id, message);

        // then
        then(sampleRepository).should(times(1)).findById(id);
        then(sampleRepository).should(times(1)).update(any(Sample.class));
    }

    @Test
    @DisplayName("존재하지 않는 샘플 수정 시 예외 발생")
    void updateSample_Fail_NotFound() {
        // given
        Long id = 99L;
        given(sampleRepository.findById(id)).willReturn(null);

        // when & then
        assertThatThrownBy(() -> sampleService.updateSample(id, "message"))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", CommonErrorCode.ENTITY_NOT_FOUND);
    }

    @Test
    @DisplayName("샘플 삭제 성공")
    void deleteSample_Success() {
        // given
        Long id = 1L;
        Sample existing = Sample.builder().id(id).message("To be deleted").build();
        given(sampleRepository.findById(id)).willReturn(existing);

        // when
        sampleService.deleteSample(id);

        // then
        then(sampleRepository).should(times(1)).findById(id);
        then(sampleRepository).should(times(1)).deleteById(id);
    }

    @Test
    @DisplayName("존재하지 않는 샘플 삭제 시 예외 발생")
    void deleteSample_Fail_NotFound() {
        // given
        Long id = 99L;
        given(sampleRepository.findById(id)).willReturn(null);

        // when & then
        assertThatThrownBy(() -> sampleService.deleteSample(id))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", CommonErrorCode.ENTITY_NOT_FOUND);
    }
}
