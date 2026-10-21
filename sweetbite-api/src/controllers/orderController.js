const pool = require('../config/db');
const { COUPONS, computeDiscount, computeDeliveryFee } = require('../utils/pricing');
const { nairobiDatePlusDays } = require('../utils/dates');

const SIZE_MULTIPLIERS = { Small: 0.7, Medium: 1, Large: 1.5 };
const FROSTING_ADDONS = { 'Buttercream': 0, 'Chocolate Ganache': 500, 'Fresh Cream': 300 };

const ORDER_CODE_OFFSET = 1000;

function toOrderCode(id) {
  return `SB-${ORDER_CODE_OFFSET + id}`;
}

function fromOrderCode(code) {
  const match = /^SB-(\d+)$/i.exec((code || '').trim());
  if (!match) return null;
  const id = parseInt(match[1], 10) - ORDER_CODE_OFFSET;
  return id > 0 ? id : null;
}

function toPublicOrder(row) {
  return {
    orderNumber: toOrderCode(row.id),
    cakeId: row.cake_id,
    cakeName: row.cake_name,
    size: row.size,
    frosting: row.frosting,
    price: row.price,
    couponCode: row.coupon_code,
    discountAmount: row.discount_amount,
    deliveryZone: row.delivery_zone,
    deliveryFee: row.delivery_fee,
    totalPrice: row.total_price,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    deliveryAddress: row.delivery_address,
    deliveryDate: row.delivery_date,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// What anyone holding an order number may see. Order numbers are sequential
// (SB-1001, SB-1002, ...) so they can be guessed — this view deliberately
// leaves out everything personal (name, phone, address, notes). It contains
// exactly what the tracking screen needs. The full order (toPublicOrder) is
// only returned to whoever just created it, and to admins via listOrders.
function toTrackingView(row) {
  return {
    orderNumber: toOrderCode(row.id),
    cakeName: row.cake_name,
    deliveryDate: row.delivery_date,
    status: row.status,
  };
}
// Returns a message if this coupon can't be used right now, otherwise null.
async function couponProblem(code, customerPhone) {
  if (!code) return null;
  const coupon = COUPONS[code];
  if (!coupon) return 'Invalid or expired coupon code.';

  if (coupon.expires && nairobiDatePlusDays(0) > coupon.expires) {
    return 'Sorry, this coupon has expired.';
  }

  if (coupon.maxUses) {
    const used = await pool.query(
      "SELECT COUNT(*)::int AS n FROM orders WHERE coupon_code = $1 AND status <> 'cancelled'",
      [code]
    );
    if (used.rows[0].n >= coupon.maxUses) {
      return 'Sorry, this coupon has been fully used.';
    }
  }

  if (coupon.firstOrderOnly) {
    // Compare the last 9 digits, so 0712 345 678 and +254712345678 match.
    const last9 = String(customerPhone).replace(/\D/g, '').slice(-9);
    const previous = await pool.query(
      `SELECT 1 FROM orders
       WHERE RIGHT(regexp_replace(customer_phone, '\\D', '', 'g'), 9) = $1
         AND status <> 'cancelled'
       LIMIT 1`,
      [last9]
    );
    if (previous.rows.length > 0) {
      return 'This coupon is for first orders only.';
    }
  }

  return null;
}
async function createOrder(req, res) {
  const {
    cakeId, size, frosting,
    customerName, customerPhone, deliveryAddress, deliveryDate, notes,
    couponCode, deliveryZone,
  } = req.body;

  const cakeResult = await pool.query('SELECT * FROM cakes WHERE id = $1', [cakeId]);
  const cake = cakeResult.rows[0];
  if (!cake) {
    return res.status(404).json({ error: 'Cake not found.' });
  }
  if (!cake.is_available) {
    return res.status(409).json({ error: 'Sorry, this cake is currently unavailable.' });
  }

    const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  if (!has(SIZE_MULTIPLIERS, size) || !has(FROSTING_ADDONS, frosting)) {
    return res.status(400).json({ error: 'Invalid size or frosting.' });
  }
  if (!deliveryZone) {
    return res.status(400).json({ error: 'Please choose a delivery zone.' });
  }

  const sizeMult = SIZE_MULTIPLIERS[size];
  const frostingFee = FROSTING_ADDONS[frosting];
  const price = Math.round(cake.price * sizeMult) + frostingFee;

  // Computed server-side from the validated code/zone — never from a
  // client-supplied amount, so a tampered request can't discount itself.
  const normalizedCoupon = couponCode ? couponCode.trim().toUpperCase() : null;
  const problem = await couponProblem(normalizedCoupon, customerPhone);
  if (problem) {
    return res.status(400).json({ error: problem });
  }
  const discountAmount = computeDiscount(price, normalizedCoupon);
  const deliveryFee = computeDeliveryFee(deliveryZone);
  const totalPrice = Math.max(0, price - discountAmount) + deliveryFee;

  const userId = req.userId || null;

  const result = await pool.query(
    `INSERT INTO orders
       (user_id, cake_id, cake_name, size, frosting, price,
        coupon_code, discount_amount, delivery_zone, delivery_fee, total_price,
        customer_name, customer_phone, delivery_address, delivery_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING *`,
    [
      userId, cake.id, cake.name, size, frosting, price,
      normalizedCoupon, discountAmount, deliveryZone || null, deliveryFee, totalPrice,
      customerName, customerPhone, deliveryAddress, deliveryDate, notes || null,
    ]
  );

  res.status(201).json({ order: toPublicOrder(result.rows[0]) });
}

async function getOrder(req, res) {
  const id = fromOrderCode(req.params.orderNumber);
  if (id === null) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  const order = result.rows[0];
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json({ order: toTrackingView(order) });
}

async function listOrders(req, res) {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status) {
    params.push(status);
    where = 'WHERE status = $1';
  }

  const result = await pool.query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
    params
  );
  res.json({ orders: result.rows.map(toPublicOrder) });
}

async function updateOrderStatus(req, res) {
  const id = fromOrderCode(req.params.orderNumber);
  if (id === null) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const { status } = req.body;
  const result = await pool.query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );

  const order = result.rows[0];
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json({ order: toPublicOrder(order) });
}

module.exports = { createOrder, getOrder, listOrders, updateOrderStatus };