ALTER TABLE transactions
    ADD COLUMN applied_rule_id BIGINT;

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_applied_rule
        FOREIGN KEY (applied_rule_id) REFERENCES mapping_rules(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_user_applied_rule
    ON transactions (user_id, applied_rule_id);
