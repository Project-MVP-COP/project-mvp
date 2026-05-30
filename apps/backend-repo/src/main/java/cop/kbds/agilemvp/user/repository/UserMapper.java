package cop.kbds.agilemvp.user.repository;

import org.apache.ibatis.annotations.Mapper;

import cop.kbds.agilemvp.user.service.User;

@Mapper
public interface UserMapper {
    void insert(User user);
    User findById(Long id);
    User findByLoginId(String loginId);
    int countByLoginId(String loginId);
    int countByNickname(String nickname);
    void update(User user);
}
