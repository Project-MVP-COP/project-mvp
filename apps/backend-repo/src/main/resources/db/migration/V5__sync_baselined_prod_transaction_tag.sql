-- 운영 DB는 V1이 baseline 처리되어 transactions.tag 컬럼이 누락된 상태일 수 있다.
-- 로컬/H2 및 신규 환경에서는 V1에서 이미 생성되므로 no-op으로 동작한다.
ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS tag VARCHAR(100);
