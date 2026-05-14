-- 5.1 users
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL    PRIMARY KEY,
    login_id      VARCHAR(50)  NOT NULL UNIQUE,
    nickname      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_status CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- 5.2 categories
CREATE TABLE IF NOT EXISTS categories (
    id            BIGSERIAL   PRIMARY KEY,
    name          VARCHAR(50) NOT NULL UNIQUE,
    color         VARCHAR(7)  NOT NULL DEFAULT '#64748b',
    display_order INTEGER     NOT NULL DEFAULT 0,
    is_default    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- 5.3 transactions
CREATE TABLE IF NOT EXISTS transactions (
    id               BIGSERIAL    PRIMARY KEY,
    user_id          BIGINT       NOT NULL,
    transaction_date DATE         NOT NULL,
    merchant         VARCHAR(200) NOT NULL,
    category_id      BIGINT,
    amount           BIGINT       NOT NULL,
    card_name        VARCHAR(50),
    installment      INTEGER      NOT NULL DEFAULT 1,
    status           VARCHAR(20)  NOT NULL DEFAULT '승인',
    memo             TEXT,
    created_at       TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_transactions_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT chk_transactions_amount      CHECK (amount >= 0),
    CONSTRAINT chk_transactions_installment CHECK (installment BETWEEN 1 AND 60),
    CONSTRAINT uk_transactions_dedup  UNIQUE (user_id, transaction_date, merchant, amount, card_name)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category  ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status    ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant  ON transactions(merchant);
