package cop.kbds.agilemvp.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cop.kbds.agilemvp.common.exception.BusinessException;
import cop.kbds.agilemvp.user.exception.UserErrorCode;
import cop.kbds.agilemvp.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User createUser(String loginId, String nickname, String passwordHash) {
        if (userRepository.existsByLoginId(loginId)) {
            throw new BusinessException(UserErrorCode.DUPLICATE_LOGIN_ID);
        }
        if (userRepository.existsByNickname(nickname)) {
            throw new BusinessException(UserErrorCode.DUPLICATE_NICKNAME);
        }

        User user = User.create(loginId, nickname, passwordHash);
        userRepository.save(user);
        return user;
    }

    public User getUserByLoginId(String loginId) {
        User user = userRepository.findByLoginId(loginId);
        if (user == null) {
            throw new BusinessException(UserErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    public User getUserById(Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new BusinessException(UserErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    @Transactional
    public void updateLastLogin(String loginId) {
        User user = getUserByLoginId(loginId);
        User loggedInUser = user.login();
        userRepository.update(loggedInUser);
    }

    @Transactional
    public void deleteUser(String loginId) {
        User user = getUserByLoginId(loginId);
        User deletedUser = user.delete();
        userRepository.update(deletedUser);
    }
}
