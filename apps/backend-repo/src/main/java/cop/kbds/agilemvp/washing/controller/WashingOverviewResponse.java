package cop.kbds.agilemvp.washing.controller;

import java.util.List;

public record WashingOverviewResponse(
        List<String> categories,
        List<WashingTransactionResponse> transactions,
        String lastImportedAt
) {
}
