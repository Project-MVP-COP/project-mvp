package com.example.demo.transaction;

import jakarta.validation.constraints.NotNull;

public record CategoryPatchRequest(@NotNull Long categoryId) {}
