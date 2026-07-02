ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS user_id BIGINT;

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS user_scope_id BIGINT NOT NULL DEFAULT -1;

UPDATE categories
SET user_scope_id = COALESCE(user_id, -1);

ALTER TABLE categories
    DROP CONSTRAINT IF EXISTS categories_name_key;

ALTER TABLE categories
    DROP CONSTRAINT IF EXISTS uk_categories_name;

ALTER TABLE categories
    ADD CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX uk_categories_user_name
    ON categories (user_scope_id, name);

CREATE INDEX idx_categories_scope_order
    ON categories (user_id, display_order);
