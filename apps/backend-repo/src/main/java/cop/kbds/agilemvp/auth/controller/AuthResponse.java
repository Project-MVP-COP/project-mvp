package cop.kbds.agilemvp.auth.controller;

public record AuthResponse(
    String accessToken,
    String nickname
) {}
