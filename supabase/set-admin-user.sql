-- Set a user as admin
-- Replace 'your-email@example.com' with the actual email of the user you want to make admin

-- Option 1: Set admin by email
UPDATE parents
SET is_admin = true
WHERE email = 'your-email@example.com';

-- Option 2: Set admin by user ID (get from Supabase Auth dashboard)
-- UPDATE parents
-- SET is_admin = true
-- WHERE id = 'your-user-uuid-here';

-- Verify the admin was set
SELECT id, email, display_name, is_admin
FROM parents
WHERE is_admin = true;

-- To remove admin access:
-- UPDATE parents SET is_admin = false WHERE email = 'your-email@example.com';
