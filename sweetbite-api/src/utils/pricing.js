// expires: last day the code works (Nairobi date, YYYY-MM-DD, inclusive)
// maxUses: total orders that may use it (cancelled orders don't count)
// firstOrderOnly: only for a phone number that has never ordered
const COUPONS = {
  SWEET15: { type: 'percent', value: 15, expires: '2026-10-31' },
  WELCOME10: { type: 'percent', value: 10, firstOrderOnly: true },
  SAVE5: { type: 'flat', value: 500, maxUses: 50, expires: '2026-12-31' },
};

const DELIVERY_ZONES = {
  Westlands: 0,
  Parklands: 200,
  CBD: 300,
  Kilimani: 250,
  Lavington: 250,
  'South B / South C': 400,
  Karen: 500,
  Runda: 500,
  Kasarani: 600,
  Ruaka: 600,
};

function computeDiscount(price, couponCode) {
  if (!couponCode) return 0;
  const coupon = COUPONS[couponCode];
  if (!coupon) return 0;
  if (coupon.type === 'percent') {
    return Math.round(price * (coupon.value / 100));
  }
  return Math.min(coupon.value, price);
}

function computeDeliveryFee(deliveryZone) {
  if (!deliveryZone) return 0;
  return DELIVERY_ZONES[deliveryZone] ?? 0;
}

module.exports = { COUPONS, DELIVERY_ZONES, computeDiscount, computeDeliveryFee };