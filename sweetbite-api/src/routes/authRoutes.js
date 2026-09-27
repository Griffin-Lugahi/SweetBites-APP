const { Router } = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

// Slows down brute-force credential guessing without blocking normal use.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').isString().withMessage('Name is required.').bail()
      .trim().isLength({ min: 1, max: 120 }).withMessage('Name is required (max 120 characters).'),
    body('email').isString().withMessage('A valid email is required.').bail()
      .trim().isEmail().withMessage('A valid email is required.')
      .isLength({ max: 255 }).withMessage('Email is too long.'),
    body('phone').optional({ checkFalsy: true })
      .isString().bail().trim().isLength({ max: 30 }).withMessage('Phone number is too long (max 30 characters).'),
    // bcrypt only uses the first 72 bytes, so longer passwords add nothing
    // but hashing cost.
    body('password').isString().bail()
      .isLength({ min: 8, max: 72 }).withMessage('Password must be between 8 and 72 characters.'),
  ],
  validate,
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isString().withMessage('A valid email is required.').bail()
      .trim().isEmail().withMessage('A valid email is required.'),
    body('password').isString().withMessage('Password is required.').bail()
      .isLength({ min: 1, max: 1000 }).withMessage('Password is required.'),
  ],
  validate,
  asyncHandler(authController.login)
);

router.get('/me', requireAuth, asyncHandler(authController.getMe));

router.patch(
  '/me',
  requireAuth,
  [
    body('name').optional({ checkFalsy: true })
      .isString().bail().trim().isLength({ min: 1, max: 120 }).withMessage('Name must be 1-120 characters.'),
    body('phone').optional({ checkFalsy: true })
      .isString().bail().trim().isLength({ max: 30 }).withMessage('Phone number is too long (max 30 characters).'),
  ],
  validate,
  asyncHandler(authController.updateMe)
);

router.post(
  '/change-password',
  requireAuth,
  [
    body('currentPassword').isString().bail().isLength({ min: 1, max: 1000 }),
    body('newPassword').isString().bail()
      .isLength({ min: 8, max: 72 }).withMessage('New password must be between 8 and 72 characters.'),
  ],
  validate,
  asyncHandler(authController.changePassword)
);

module.exports = router;