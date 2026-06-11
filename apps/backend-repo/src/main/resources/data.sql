INSERT INTO temp (message, status) VALUES ('Hello World', 'ACTIVE');
INSERT INTO temp (message, status) VALUES ('System Down ASAP!', 'ACTIVE');
INSERT INTO temp (message, status) VALUES ('Scheduled Maintenance', 'INACTIVE');

INSERT INTO users (login_id, nickname, password_hash, status, created_at, updated_at)
VALUES ('testuser', '테스트유저', '$2a$10$lZ5xJrVmQKn6BbEZOM14L.H552C2hBzVrvgPixgBw8qE/nK4H1vYW', 'active', NOW(), NOW());

INSERT INTO categories (name, color, display_order, is_default) VALUES
('식음료',   '#ef4444', 1,  TRUE),
('쇼핑',     '#f97316', 2,  TRUE),
('교통',     '#3b82f6', 3,  TRUE),
('의료/건강','#22c55e', 4,  TRUE),
('문화/여가','#a855f7', 5,  TRUE),
('편의점',   '#f59e0b', 6,  TRUE),
('주유',     '#6b7280', 7,  TRUE),
('통신',     '#06b6d4', 8,  TRUE),
('교육',     '#84cc16', 9,  TRUE),
('기타',     '#64748b', 10, TRUE);

