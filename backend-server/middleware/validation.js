// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation Middleware
 * ให้ครบ 100%
 */

// User creation validation
exports.validateCreateUser = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .matches(/^(AG|SP|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/)
    .withMessage('Username must be in format: AGxxx, SPxxx, or ADxxx (001-999)'),
  
  body('fullName')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['Agent', 'Supervisor', 'Admin']).withMessage('Invalid role'),
  
  body('teamId')
    .optional()
    .isInt({ min: 1 }).withMessage('Team ID must be a positive integer'),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
  
  // Custom validation: Agent/Supervisor must have teamId
  body('teamId').custom((value, { req }) => {
    if ((req.body.role === 'Agent' || req.body.role === 'Supervisor') && !value) {
      throw new Error('Team ID is required for Agent and Supervisor roles');
    }
    return true;
  })
];

// User update validation
exports.validateUpdateUser = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('Invalid user ID'),
  
  body('username')
    .optional()
    .custom(() => {
      throw new Error('Username cannot be changed');
    }),
  
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  
  body('role')
    .optional()
    .isIn(['Agent', 'Supervisor', 'Admin']).withMessage('Invalid role'),
  
  body('teamId')
    .optional()
    .isInt({ min: 1 }).withMessage('Team ID must be a positive integer'),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive')
];

// User ID validation
exports.validateUserId = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('Invalid user ID')
];

// Query filters validation
exports.validateUserFilters = [
  query('role')
    .optional()
    .isIn(['Agent', 'Supervisor', 'Admin']).withMessage('Invalid role filter'),
  
  query('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Invalid status filter'),
  
  query('teamId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid team ID filter')
];

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};