package cop.kbds.agilemvp.common.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class GlobalResponseAdviceTestController {

    @GetMapping("/test/normal")
    public TestData normal() {
        return new TestData("test");
    }

    @GetMapping("/test/api-response")
    public ApiResponse<String> apiResponse() {
        return ApiResponse.success("already-wrapped", "custom-message");
    }

    @GetMapping("/test/response-entity")
    public ResponseEntity<TestData> responseEntity() {
        return ResponseEntity.ok(new TestData("no-wrap"));
    }

    static record TestData(String name) {}
}
