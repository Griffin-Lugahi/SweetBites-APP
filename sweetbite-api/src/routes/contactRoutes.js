const { Router } = require('express');
const { body } = require('express-validator');

const contactController = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

const createValidators = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('message').trim().notEmpty().withMessage('Message is required.'),
];

router.post('/', createValidators, validate, asyncHandler(contactController.createMessage));

router.get('/', requireAuth, requireAdmin, asyncHandler(contactController.listMessages));
router.patch('/:id/read', requireAuth, requireAdmin, asyncHandler(contactController.markRead));
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(contactController.deleteMessage));

module.exports = router;