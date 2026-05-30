package cop.kbds.agilemvp.auth.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "로그인 ID는 필수입니다.")
    @Size(min = 2, max = 50, message = "로그인 ID는 2자 이상 50자 이하이어야 합니다.")
    String loginId,

    @NotBlank(message = "닉네임은 필수입니다.")
    @Size(min = 1, max = 50, message = "닉네임은 1자 이상 50자 이하이어야 합니다.")
    String nickname,

    @NotBlank(message = "비밀번호는 필수입니다.")
    String password
) {}
