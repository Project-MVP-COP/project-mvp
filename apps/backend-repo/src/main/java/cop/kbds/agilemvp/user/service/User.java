package cop.kbds.agilemvp.user.service;

import java.time.LocalDateTime;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.user.exception.UserErrorCode;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Setter(AccessLevel.PRIVATE)
    private Long id;
    private String loginId;
    private String nickname;
    private String passwordHash;
    private String status;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static User create(String loginId, String nickname, String passwordHash) {
        validate(loginId, nickname, passwordHash);
        return User.builder()
                .loginId(loginId)
                .nickname(nickname)
                .passwordHash(passwordHash)
                .status("active")
                .build();
    }

    // MyBatis constructor 매핑용 생성자
    public User(Long id, String loginId, String nickname, String passwordHash, String status,
                LocalDateTime lastLoginAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.loginId = loginId;
        this.nickname = nickname;
        this.passwordHash = passwordHash;
        this.status = status;
        this.lastLoginAt = lastLoginAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    private static void validate(String loginId, String nickname, String passwordHash) {
        if (loginId == null || loginId.trim().length() < 2) {
            throw new BusinessException(UserErrorCode.INVALID_LOGIN_ID);
        }
        if (nickname == null || nickname.trim().isEmpty()) {
            throw new BusinessException(UserErrorCode.INVALID_NICKNAME);
        }
        if (passwordHash == null || passwordHash.trim().isEmpty()) {
            throw new BusinessException(UserErrorCode.INVALID_PASSWORD_HASH);
        }
    }

    public User login() {
        return new User(this.id, this.loginId, this.nickname, this.passwordHash, this.status, LocalDateTime.now(), this.createdAt, LocalDateTime.now());
    }

    public User delete() {
        return new User(this.id, this.loginId, this.nickname, this.passwordHash, "deleted", this.lastLoginAt, this.createdAt, LocalDateTime.now());
    }
}
