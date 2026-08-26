INSERT INTO monthly_goals (
    user_id,
    goal_month,
    title,
    target_category,
    reduction_ratio,
    baseline_amount,
    monthly_save,
    status,
    actual_saved
)
SELECT u.id,
       CAST(DATEADD('MONTH', -2, DATE_TRUNC('MONTH', CURRENT_DATE)) AS DATE),
       '식비 30% 줄이기',
       '식음료',
       0.3000,
       100000,
       30000,
       'completed',
       32000
FROM users u
WHERE u.login_id = 'testuser'
  AND NOT EXISTS (
      SELECT 1
      FROM monthly_goals mg
      WHERE mg.user_id = u.id
        AND mg.goal_month = CAST(DATEADD('MONTH', -2, DATE_TRUNC('MONTH', CURRENT_DATE)) AS DATE)
  );

INSERT INTO monthly_goals (
    user_id,
    goal_month,
    title,
    target_category,
    reduction_ratio,
    baseline_amount,
    monthly_save,
    status,
    actual_saved
)
SELECT u.id,
       CAST(DATEADD('MONTH', -1, DATE_TRUNC('MONTH', CURRENT_DATE)) AS DATE),
       '생활비 20% 줄이기',
       '생활',
       0.2000,
       150000,
       30000,
       'active',
       NULL
FROM users u
WHERE u.login_id = 'testuser'
  AND NOT EXISTS (
      SELECT 1
      FROM monthly_goals mg
      WHERE mg.user_id = u.id
        AND mg.goal_month = CAST(DATEADD('MONTH', -1, DATE_TRUNC('MONTH', CURRENT_DATE)) AS DATE)
  );
