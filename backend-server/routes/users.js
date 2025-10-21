// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validation = require('../middleware/validation');
// const auth = require('../middleware/auth'); // ถ้ามี auth middleware

/**
 * User Management Routes
 * ให้ครบ 100%
 */

// GET /api/users - Get all users
router.get('/',
  // auth.verifyToken,           // TODO: เปิดใช้งานถ้าต้องการ authentication
  // auth.requireAdmin,          // TODO: เปิดใช้งานถ้าต้องการ admin only
  validation.validateUserFilters,
  validation.handleValidationErrors,
  userController.getAllUsers
);

// GET /api/users/:id - Get user by ID
router.get('/:id',
  // auth.verifyToken,
  validation.validateUserId,
  validation.handleValidationErrors,
  userController.getUserById
);

// POST /api/users - Create new user
router.post('/',
  // auth.verifyToken,
  // auth.requireAdmin,
  validation.validateCreateUser,
  validation.handleValidationErrors,
  userController.createUser
);

// PUT /api/users/:id - Update user
router.put('/:id',
  // auth.verifyToken,
  // auth.requireAdmin,
  validation.validateUpdateUser,
  validation.handleValidationErrors,
  userController.updateUser
);

// DELETE /api/users/:id - Delete user (soft delete)
router.delete('/:id',
  // auth.verifyToken,
  // auth.requireAdmin,
  validation.validateUserId,
  validation.handleValidationErrors,
  userController.deleteUser
);

module.exports = router;