INSERT INTO temp (message, status) VALUES ('Hello World', 'ACTIVE');
INSERT INTO temp (message, status) VALUES ('System Down ASAP!', 'ACTIVE');
INSERT INTO temp (message, status) VALUES ('Scheduled Maintenance', 'INACTIVE');

INSERT INTO users (login_id, nickname, password_hash, status, created_at, updated_at)
SELECT 'testuser', '테스트유저', '$2a$10$lZ5xJrVmQKn6BbEZOM14L.H552C2hBzVrvgPixgBw8qE/nK4H1vYW', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE login_id = 'testuser');
