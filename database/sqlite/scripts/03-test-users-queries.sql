-- Test queries for users table

-- 1. Get all active users
SELECT * FROM users WHERE deletedAt IS NULL;

-- 2. Get users by role
SELECT * FROM users WHERE role = 'Agent' AND deletedAt IS NULL;

-- 3. Get user with team info
SELECT 
    u.id,
    u.username,
    u.fullName,
    u.role,
    t.team_name as teamName,
    u.status
FROM users u
LEFT JOIN teams t ON u.teamId = t.team_id
WHERE u.deletedAt IS NULL;

-- 4. Count users by role
SELECT role, COUNT(*) as count 
FROM users 
WHERE deletedAt IS NULL 
GROUP BY role;

-- 5. Find user by username
SELECT * FROM users 
WHERE username = 'AG001' AND deletedAt IS NULL;

-- 6. Test Foreign Key constraint
-- This should fail if team doesn't exist
-- INSERT INTO users (username, fullName, role, teamId, status) 
-- VALUES ('AG999', 'Test Agent', 'Agent', 999, 'Active');