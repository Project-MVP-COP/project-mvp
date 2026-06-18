package cop.kbds.agilemvp.transaction.controller;

import java.util.List;

public record BulkUploadResult(List<TransactionDto> added, int skippedCount) {}
