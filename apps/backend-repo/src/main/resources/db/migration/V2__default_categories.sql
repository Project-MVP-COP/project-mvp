INSERT INTO categories (name, color, display_order, is_default)
SELECT '식음료', '#ef4444', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '식음료');

INSERT INTO categories (name, color, display_order, is_default)
SELECT '쇼핑', '#f97316', 2, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '쇼핑');

INSERT INTO categories (name, color, display_order, is_default)
SELECT '교통', '#3b82f6', 3, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '교통');

INSERT INTO categories (name, color, display_order, is_default)
SELECT '의료/건강', '#22c55e', 4, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '의료/건강');

INSERT INTO categories (name, color, display_order, is_default)
SELECT '문화/여가', '#a855f7', 5, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '문화/여가');

INSERT INTO categories (name, color, display_order, is_default)
SELECT '편의점', '#f59e0b', 6, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '편의점');

INSERT INTO categories (name, color, display_order, is_default)
SELECT '주유', '#6b7280', 7, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '주유');

INSERT INTO categories (name, color, display_order, is_default)
SELECT '통신', '#06b6d4', 8, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '통신');

INSERT INTO categories (name, color, display_order, is_default)
SELECT '교육', '#84cc16', 9, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '교육');

INSERT INTO categories (name, color, display_order, is_default)
SELECT '기타', '#64748b', 10, TRUE
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '기타');
