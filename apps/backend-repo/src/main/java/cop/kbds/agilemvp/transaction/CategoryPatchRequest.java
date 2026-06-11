package cop.kbds.agilemvp.transaction;

import jakarta.validation.constraints.NotNull;

public record CategoryPatchRequest(@NotNull Long categoryId) {}
