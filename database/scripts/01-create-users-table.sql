-- ========================================
-- Task#1: User Management - users Table
-- Version: 1.2 (Updated with FK pragma)
-- ========================================

-- 🆕 IMPORTANT: เปิดใช้งาน Foreign Key constraints
PRAGMA foreign_keys = ON;

-- ลบตารางเดิมถ้ามี (สำหรับ development)
DROP TABLE IF EXISTS users;

-- สร้างตาราง users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    fullName TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Agent', 'Supervisor', 'Admin')),
    teamId INTEGER,
    status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastLoginAt DATETIME,
    deletedAt DATETIME,
    FOREIGN KEY (teamId) REFERENCES teams(team_id)
);

-- สร้าง indexes เพื่อ performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_teamId ON users(teamId);
CREATE INDEX idx_users_deletedAt ON users(deletedAt);

-- สร้าง trigger สำหรับ updatedAt
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;