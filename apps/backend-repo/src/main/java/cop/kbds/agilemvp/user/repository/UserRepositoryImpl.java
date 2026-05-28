package cop.kbds.agilemvp.user.repository;

import org.springframework.stereotype.Repository;

import cop.kbds.agilemvp.user.service.User;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserMapper userMapper;

    @Override
    public void save(User user) {
        userMapper.insert(user);
    }

    @Override
    public User findById(Long id) {
        return userMapper.findById(id);
    }

    @Override
    public User findByLoginId(String loginId) {
        return userMapper.findByLoginId(loginId);
    }

    @Override
    public boolean existsByLoginId(String loginId) {
        return userMapper.countByLoginId(loginId) > 0;
    }

    @Override
    public boolean existsByNickname(String nickname) {
        return userMapper.countByNickname(nickname) > 0;
    }

    @Override
    public void update(User user) {
        userMapper.update(user);
    }
}
