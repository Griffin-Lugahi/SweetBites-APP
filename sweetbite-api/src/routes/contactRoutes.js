const { Router } = require('express');
const { body, param } = require('express-validator');
const rateLimit = require('express-rate-limit');

const contactController = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

// The form is public, so cap how fast one connection can send messages.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent. Please try again later, or reach us on WhatsApp.' },
});

const createValidators = [
  body('name').isString().withMessage('Name is required.').bail()
    .trim().isLength({ min: 1, max: 120 }).withMessage('Name is required (max 120 characters).'),
  body('email').isString().withMessage('A valid email is required.').bail()
    .trim().isEmail().withMessage('A valid email is required.')
    .isLength({ max: 255 }).withMessage('Email is too long.'),
  body('message').isString().withMessage('Message is required.').bail()
    .trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required (max 2000 characters).'),
];

const idParam = param('id').isInt({ min: 1, max: 2147483647 }).withMessage('Invalid id.');

router.post('/', contactLimiter, createValidators, validate, asyncHandler(contactController.createMessage));

router.get('/', requireAuth, requireAdmin, asyncHandler(contactController.listMessages));
router.patch('/:id/read', requireAuth, requireAdmin, idParam, validate, asyncHandler(contactController.markRead));
router.delete('/:id', requireAuth, requireAdmin, idParam, validate, asyncHandler(contactController.deleteMessage));

module.exports = router;