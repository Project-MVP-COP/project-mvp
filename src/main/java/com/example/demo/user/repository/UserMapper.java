package com.example.demo.user.repository;

import com.example.demo.user.service.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    void insert(User user);
    User findById(Long id);
    User findByLoginId(String loginId);
    int countByLoginId(String loginId);
    int countByNickname(String nickname);
    void update(User user);
}
