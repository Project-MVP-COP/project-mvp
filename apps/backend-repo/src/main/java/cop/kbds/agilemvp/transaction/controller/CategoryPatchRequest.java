package cop.kbds.agilemvp.transaction.controller;

import jakarta.validation.constraints.NotNull;

public record CategoryPatchRequest(@NotNull Long categoryId) {}
