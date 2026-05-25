INSERT INTO temp (message, status) VALUES ('Hello World', 'ACTIVE');
INSERT INTO temp (message, status) VALUES ('System Down ASAP!', 'ACTIVE');
INSERT INTO temp (message, status) VALUES ('Scheduled Maintenance', 'INACTIVE');

INSERT INTO users (login_id, nickname, password_hash, status, created_at, updated_at)
VALUES ('testuser', '테스트유저', '$2a$10$7R9rO/r5B0L2.f96Hq0s5OzFhE7zV.Y9XfJ13E/e0w2dOa8m1g.Ky', 'active', NOW(), NOW());

