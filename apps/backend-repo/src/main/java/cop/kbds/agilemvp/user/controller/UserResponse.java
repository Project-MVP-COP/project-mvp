package cop.kbds.agilemvp.user.controller;

import cop.kbds.agilemvp.common.util.DateTimeUtil;
import cop.kbds.agilemvp.user.service.User;
import io.swagger.v3.oas.annotations.media.Schema;

public record UserResponse(
    Long id,
    String loginId,
    String nickname,
    @Schema(allowableValues = {"active", "suspended", "deleted"})
    String status,
    String lastLoginAt,
    String createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getLoginId(),
            user.getNickname(),
            user.getStatus(),
            user.getLastLoginAt() != null ? DateTimeUtil.format(user.getLastLoginAt()) : null,
            user.getCreatedAt() != null ? DateTimeUtil.format(user.getCreatedAt()) : null
        );
    }
}
