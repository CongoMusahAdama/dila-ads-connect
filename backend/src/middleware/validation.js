const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  console.log('=== VALIDATION CHECK ===');
  console.log('Request body:', req.body);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors found:', errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  console.log('Validation passed!');
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be between 1 and 50 characters'),
  body('lastName')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be between 1 and 50 characters'),
  body('role')
    .isIn(['advertiser', 'owner'])
    .withMessage('Role must be either advertiser or owner'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required if provided'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required if provided'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  // Custom validation to ensure at least one of email or phone is provided
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('Either email or phone number is required');
    }
    return true;
  }),
  handleValidationErrors
];

// Billboard validation rules
const validateBillboard = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),
  body('size')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Size must be between 1 and 50 characters'),
  body('pricePerDay')
    .isDecimal({ decimal_digits: '0,2' })
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  handleValidationErrors
];

// Booking request validation rules
const validateBookingRequest = [
  body('billboardId')
    .isMongoId()
    .withMessage('Valid billboard ID is required'),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid end date is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters'),
  handleValidationErrors
];

// Complaint validation rules
const validateComplaint = [
  body('subject')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  handleValidationErrors
];

// Profile validation rules
const validateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('role')
    .optional()
    .isIn(['ADVERTISER', 'OWNER', 'ADMIN'])
    .withMessage('Role must be either ADVERTISER, OWNER, or ADMIN'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  handleValidationErrors
];

// UUID parameter validation (for MongoDB ObjectIds)
const validateUUID = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Valid ${paramName} is required`),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateBillboard,
  validateBookingRequest,
  validateComplaint,
  validateProfile,
  validateUUID,
  validatePagination
};

