const { Router } = require('express');
const { body, param } = require('express-validator');

const cakeController = require('../controllers/cakeController');
const validate = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

const VALID_TAGS = ['Chocolate', 'Fruity', 'Citrus', 'Premium', 'Classic', 'Caramel'];
const VALID_BADGES = ['popular', 'new'];

const URL_OPTS = { protocols: ['http', 'https'], require_protocol: true };
const MAX_PRICE = 10000000;

const createValidators = [
  body('name').trim().isLength({ min: 1, max: 120 }).withMessage('Name is required (max 120 characters).'),
  body('shortDesc').trim().isLength({ min: 1, max: 240 }).withMessage('shortDesc is required (max 240 characters).'),
  body('fullDesc').trim().notEmpty().withMessage('fullDesc is required.'),
  body('price').isInt({ min: 0, max: MAX_PRICE }).withMessage('price must be a whole number between 0 and 10,000,000.'),
  body('tag').isIn(VALID_TAGS).withMessage(`tag must be one of: ${VALID_TAGS.join(', ')}`),
  body('badge').optional({ checkFalsy: true }).isIn(VALID_BADGES),
  body('imageUrl').trim().isURL(URL_OPTS).withMessage('imageUrl must be a valid http(s) URL.'),
  body('galleryUrls').optional().isArray({ max: 10 }),
  body('galleryUrls.*').optional().isURL(URL_OPTS).withMessage('Each galleryUrls entry must be a valid http(s) URL.'),
];

const updateValidators = [
  body('name').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('shortDesc').optional({ checkFalsy: true }).trim().isLength({ max: 240 }),
  body('fullDesc').optional({ checkFalsy: true }).trim().notEmpty(),
  body('price').optional().isInt({ min: 0, max: MAX_PRICE }),
  body('tag').optional().isIn(VALID_TAGS),
  body('badge').optional({ nullable: true }).isIn(VALID_BADGES),
  body('imageUrl').optional({ checkFalsy: true }).trim().isURL(URL_OPTS),
  body('galleryUrls').optional().isArray({ max: 10 }),
  body('galleryUrls.*').optional().isURL(URL_OPTS),
  body('isAvailable').optional().isBoolean(),
];
// A non-numeric id (e.g. /cakes/abc) would otherwise reach Postgres and
// come back as a 500.
const idParam = param('id').isInt({ min: 1, max: 2147483647 }).withMessage('Invalid id.');

router.get('/', asyncHandler(cakeController.listCakes));
router.get('/:id', idParam, validate, asyncHandler(cakeController.getCake));

router.post('/', requireAuth, requireAdmin, createValidators, validate, asyncHandler(cakeController.createCake));
router.patch('/:id', requireAuth, requireAdmin, idParam, updateValidators, validate, asyncHandler(cakeController.updateCake));
router.delete('/:id', requireAuth, requireAdmin, idParam, validate, asyncHandler(cakeController.deleteCake));

module.exports = router;