package com.example.demo.user.service;

import com.example.demo.common.exception.BusinessException;
import com.example.demo.user.exception.UserErrorCode;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User createUser(String loginId, String nickname, String passwordHash) {
        if (userRepository.existsByLoginId(loginId))
            throw new BusinessException(UserErrorCode.DUPLICATE_LOGIN_ID);
        if (userRepository.existsByNickname(nickname))
            throw new BusinessException(UserErrorCode.DUPLICATE_NICKNAME);
        User user = User.create(loginId, nickname, passwordHash);
        userRepository.save(user);
        return user;
    }

    public User getUserByLoginId(String loginId) {
        User user = userRepository.findByLoginId(loginId);
        if (user == null)
            throw new BusinessException(UserErrorCode.USER_NOT_FOUND);
        if (!"active".equals(user.getStatus()))
            throw new BusinessException(UserErrorCode.USER_NOT_ACTIVE);
        return user;
    }

    @Transactional
    public void updateLastLogin(String loginId) {
        User user = getUserByLoginId(loginId);
        userRepository.update(user.login());
    }
}
