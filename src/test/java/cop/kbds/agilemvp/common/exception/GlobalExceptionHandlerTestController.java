package cop.kbds.agilemvp.common.exception;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
class GlobalExceptionHandlerTestController {

    @GetMapping("/test/business-exception")
    public void businessException() {
        throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND);
    }

    @GetMapping("/test/missing-param")
    public void missingParam(@RequestParam String name) {
    }

    @GetMapping("/test/type-mismatch")
    public void typeMismatch(@RequestParam Long id) {
    }

    @GetMapping("/test/runtime-exception")
    public void runtimeException() {
        throw new RuntimeException("Unexpected error");
    }
}
