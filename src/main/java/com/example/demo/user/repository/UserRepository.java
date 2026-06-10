package com.example.demo.user.repository;

import com.example.demo.user.service.User;

public interface UserRepository {
    void save(User user);
    User findById(Long id);
    User findByLoginId(String loginId);
    boolean existsByLoginId(String loginId);
    boolean existsByNickname(String nickname);
    void update(User user);
}
