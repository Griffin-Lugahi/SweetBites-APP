// Coupon and delivery-zone data, mirrored from the frontend's script.js.
// The frontend copy is for instant UI feedback only — this file is the
// source of truth the server actually charges against, so a request can
// never supply its own discount amount or delivery fee and have it trusted.
const COUPONS = {
  SWEET15: { type: 'percent', value: 15 },
  WELCOME10: { type: 'percent', value: 10 },
  SAVE5: { type: 'flat', value: 500 },
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