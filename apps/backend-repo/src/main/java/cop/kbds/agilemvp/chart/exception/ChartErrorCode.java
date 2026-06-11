package cop.kbds.agilemvp.chart.exception;

import cop.kbds.agilemvp.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ChartErrorCode implements ErrorCode {
    CHART_DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "CHT001", "차트 데이터를 찾을 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() { return this.name(); }
}
