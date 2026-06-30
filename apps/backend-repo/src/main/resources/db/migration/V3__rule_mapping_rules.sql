ALTER TABLE transactions
    ADD COLUMN is_classified BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE transactions
SET is_classified = TRUE
WHERE category_id IS NOT NULL;

CREATE TABLE mapping_rules (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    keyword     VARCHAR(100) NOT NULL,
    keyword_normalized VARCHAR(100) NOT NULL,
    category_id BIGINT       NOT NULL,
    tag         VARCHAR(100),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rules_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_rules_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uk_rules_user_keyword
    ON mapping_rules (user_id, keyword_normalized);
