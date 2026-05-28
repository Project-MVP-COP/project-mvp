package cop.kbds.agilemvp.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.user.exception.UserErrorCode;
import cop.kbds.agilemvp.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("신규 회원 생성 요청 시 중복이 없으면 정상적으로 회원을 저장하고 반환한다")
    void createUser_Success() {
        // given
        given(userRepository.existsByLoginId("newuser")).willReturn(false);
        given(userRepository.existsByNickname("뉴유저")).willReturn(false);

        // when
        User user = userService.createUser("newuser", "뉴유저", "hashed-password");

        // then
        assertThat(user).isNotNull();
        assertThat(user.getLoginId()).isEqualTo("newuser");
        assertThat(user.getNickname()).isEqualTo("뉴유저");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("회원 생성 요청 시 로그인 ID가 중복되면 예외(DUPLICATE_LOGIN_ID)가 발생한다")
    void createUser_DuplicateLoginId_Fail() {
        // given
        given(userRepository.existsByLoginId("dupuser")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.createUser("dupuser", "뉴유저", "hashed-password"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(UserErrorCode.DUPLICATE_LOGIN_ID.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("회원 생성 요청 시 닉네임이 중복되면 예외(DUPLICATE_NICKNAME)가 발생한다")
    void createUser_DuplicateNickname_Fail() {
        // given
        given(userRepository.existsByLoginId("newuser")).willReturn(false);
        given(userRepository.existsByNickname("dupname")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.createUser("newuser", "dupname", "hashed-password"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(UserErrorCode.DUPLICATE_NICKNAME.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("최종 로그인 시각 업데이트 시 사용자가 존재하면 last_login_at이 갱신되어 저장된다")
    void updateLastLogin_Success() {
        // given
        User user = new User(1L, "newuser", "뉴유저", "hashed-password", "active", null, null, null);
        given(userRepository.findByLoginId("newuser")).willReturn(user);

        // when
        userService.updateLastLogin("newuser");

        // then
        verify(userRepository).update(any(User.class));
    }

    @Test
    @DisplayName("회원 탈퇴 요청 시 사용자가 존재하면 상태가 deleted로 갱신되어 저장된다")
    void deleteUser_Success() {
        // given
        User user = new User(1L, "newuser", "뉴유저", "hashed-password", "active", null, null, null);
        given(userRepository.findByLoginId("newuser")).willReturn(user);

        // when
        userService.deleteUser("newuser");

        // then
        verify(userRepository).update(any(User.class));
    }
}
