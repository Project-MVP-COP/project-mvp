package cop.kbds.agilemvp.transaction.exception;

import cop.kbds.agilemvp.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum TransactionErrorCode implements ErrorCode {

    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "TRX001", "거래 내역을 찾을 수 없습니다."),
    DUPLICATE_TRANSACTION(HttpStatus.CONFLICT, "TRX002", "이미 존재하는 거래 내역입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() {
        return this.name();
    }
}
