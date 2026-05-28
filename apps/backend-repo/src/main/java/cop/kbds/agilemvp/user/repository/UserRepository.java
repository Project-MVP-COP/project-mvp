package cop.kbds.agilemvp.user.repository;

import cop.kbds.agilemvp.user.service.User;

public interface UserRepository {
    void save(User user);
    User findById(Long id);
    User findByLoginId(String loginId);
    boolean existsByLoginId(String loginId);
    boolean existsByNickname(String nickname);
    void update(User user);
}
