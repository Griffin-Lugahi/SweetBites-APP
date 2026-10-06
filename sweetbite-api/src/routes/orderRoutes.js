const { Router } = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const orderController = require('../controllers/orderController');
const validate = require('../middleware/validate');
const { requireAuth, optionalAuth, requireAdmin } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { nairobiDatePlusDays, isRealCalendarDate } = require('../utils/dates');
const { COUPONS, DELIVERY_ZONES } = require('../utils/pricing');

const router = Router();

const VALID_SIZES = ['Small', 'Medium', 'Large'];
const VALID_FROSTINGS = ['Buttercream', 'Chocolate Ganache', 'Fresh Cream'];
const VALID_STATUSES = ['confirmed', 'baking', 'delivery', 'delivered', 'cancelled'];

const MAX_ADVANCE_DAYS = 365;
const MAX_INT = 2147483647; // Postgres INTEGER

// Anyone can place an order (no login needed), so cap how fast one
// connection can create them. Generous enough for an office sharing an IP.
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders from this connection. Please try again later, or message us on WhatsApp.' },
});

// Limits below match the column sizes in db/schema.sql — without them an
// over-long value passes validation and then fails inside Postgres as a 500.
const createValidators = [
  body('cakeId').isInt({ min: 1, max: MAX_INT }).withMessage('cakeId is required.').toInt(),
  body('size').isIn(VALID_SIZES).withMessage(`size must be one of: ${VALID_SIZES.join(', ')}`),
  body('frosting').isIn(VALID_FROSTINGS).withMessage(`frosting must be one of: ${VALID_FROSTINGS.join(', ')}`),
  body('customerName')
    .isString().withMessage('Please enter your full name.').bail()
    .trim().isLength({ min: 1, max: 120 }).withMessage('Please enter your full name (max 120 characters).'),
  body('customerPhone')
    .isString().withMessage('Please enter a phone number.').bail()
    .trim().matches(/^[\d\s+\-()]{7,30}$/).withMessage('Enter a valid phone number (7-30 characters: digits, spaces, + - ( ) ).'),
  body('deliveryAddress')
    .isString().withMessage('Please enter a delivery address.').bail()
    .trim().isLength({ min: 1, max: 300 }).withMessage('Please enter a delivery address (max 300 characters).'),
  body('deliveryDate').custom((value) => {
    if (!isRealCalendarDate(value)) {
      throw new Error('Delivery date must be a real date in YYYY-MM-DD format.');
    }
    if (value < nairobiDatePlusDays(1)) {
      throw new Error('Delivery date must be tomorrow or later.');
    }
    if (value > nairobiDatePlusDays(MAX_ADVANCE_DAYS)) {
      throw new Error('Delivery date must be within the next 12 months.');
    }
    return true;
  }),
  body('notes')
    .optional({ checkFalsy: true })
    .isString().withMessage('Notes must be text.').bail()
    .trim().isLength({ max: 500 }).withMessage('Special instructions can be at most 500 characters.'),
  // Both optional: an order can go through with no coupon and no delivery
  // zone selected. If present, they must match a code/zone we recognize —
  // the discount and fee themselves are computed server-side, never
  // accepted from the request.
  body('couponCode')
    .optional({ checkFalsy: true })
    .isString().withMessage('Coupon code must be text.').bail()
    .trim()
    .customSanitizer((value) => value.toUpperCase())
    .isIn(Object.keys(COUPONS)).withMessage('Invalid or expired coupon code.'),
  body('deliveryZone')
    .optional({ checkFalsy: true })
    .isString().withMessage('Delivery zone must be text.').bail()
    .trim()
    .isIn(Object.keys(DELIVERY_ZONES)).withMessage('Please select a valid delivery zone.'),
];

const statusValidators = [
  body('status').isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),
];

router.post('/', orderLimiter, optionalAuth, createValidators, validate, asyncHandler(orderController.createOrder));

// Public order tracking — returns a limited, non-personal view (see
// toTrackingView in the controller).
router.get('/:orderNumber', asyncHandler(orderController.getOrder));

router.get('/', requireAuth, requireAdmin, asyncHandler(orderController.listOrders));
router.patch('/:orderNumber/status', requireAuth, requireAdmin, statusValidators, validate, asyncHandler(orderController.updateOrderStatus));

module.exports = router;