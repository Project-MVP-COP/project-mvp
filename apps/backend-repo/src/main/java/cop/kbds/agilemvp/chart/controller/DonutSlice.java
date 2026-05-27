package cop.kbds.agilemvp.chart.controller;

import io.swagger.v3.oas.annotations.media.Schema;

public record DonutSlice(
        String name,
        Long   value,
        String color
) {}
