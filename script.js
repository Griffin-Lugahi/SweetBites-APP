//  TOAST 
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message, type = 'success') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = 'show' + (type === 'error' ? ' error' : '');
  toastTimer = setTimeout(() => { toast.className = ''; }, 3500);
}


// FOCUS TRAP (for modals / dropdowns)
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])';
const focusTrapStack = [];

function pushFocusTrap(container) {
  const previouslyFocused = document.activeElement;

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
      .filter(el => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeydown);
  focusTrapStack.push({ container, handleKeydown, previouslyFocused });
}

function popFocusTrap() {
  const trap = focusTrapStack.pop();
  if (!trap) return;
  trap.container.removeEventListener('keydown', trap.handleKeydown);
  if (trap.previouslyFocused && typeof trap.previouslyFocused.focus === 'function') {
    trap.previouslyFocused.focus();
  }
}


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// PROMO BANNER
const promoBanner = document.getElementById('promo-banner');
const promoClose   = document.getElementById('promo-close');

if (sessionStorage.getItem('promoDismissed') === '1') {
  promoBanner.classList.add('hidden');
}

promoClose.addEventListener('click', () => {
  promoBanner.classList.add('hidden');
  sessionStorage.setItem('promoDismissed', '1');
});

// BACK TO TOP
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// DARK MODE TOGGLE
const themeToggle = document.getElementById('theme-toggle');
const iconMoon    = document.getElementById('icon-moon');
const iconSun     = document.getElementById('icon-sun');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  iconMoon.style.display = 'none';
  iconSun.style.display  = 'block';
  themeToggle.setAttribute('aria-pressed', 'true');
}

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  iconMoon.style.display = isDark ? 'none'  : 'block';
  iconSun.style.display  = isDark ? 'block' : 'none';
  themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// SCROLL REVEAL 
const revealEls = document.querySelectorAll('.feature, .testi-card, .about-block, .stat-card, .gallery-item, .faq-item');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));


// CAKE FILTER BAR
const cakeFilterBtns  = document.querySelectorAll('.cake-filter-btn');
const cakeFilterEmpty = document.getElementById('cake-filter-empty');
let currentCakeFilter = 'All';

function applyCakeFilter() {
  const priceCards = document.querySelectorAll('.price-card');
  let visibleCount = 0;
  priceCards.forEach(card => {
    const matches = currentCakeFilter === 'All' || card.dataset.tag === currentCakeFilter;
    card.classList.toggle('filter-hidden', !matches);
    if (matches) {
      card.classList.add('visible');
      visibleCount++;
    }
  });
  cakeFilterEmpty.classList.toggle('hidden', visibleCount > 0);
}

cakeFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentCakeFilter = btn.dataset.filter;

    cakeFilterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    applyCakeFilter();
  });
});


// ACTIVE NAV ON SCROLL 
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', highlightNav, { passive: true });

function highlightNav() {
  const scrollY = window.scrollY + 130;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    if (scrollY >= top && scrollY < bottom) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}


//  HAMBURGER MENU 
const hamburger = document.getElementById('hamburger');
const navBar    = document.getElementById('nav-bar');

function setHamburgerOpen(isOpen) {
  hamburger.classList.toggle('open', isOpen);
  navBar.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

hamburger.addEventListener('click', () => {
  setHamburgerOpen(!hamburger.classList.contains('open'));
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    setHamburgerOpen(false);
  });
});

// NAV — "More" DROPDOWN
const navDropdown   = document.getElementById('nav-dropdown');
const navMoreToggle = document.getElementById('nav-more-toggle');

function closeNavDropdown() {
  navDropdown.classList.remove('open');
  navMoreToggle.setAttribute('aria-expanded', 'false');
}

navMoreToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = navDropdown.classList.toggle('open');
  navMoreToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (e) => {
  if (!navDropdown.classList.contains('open')) return;
  if (navDropdown.contains(e.target)) return;
  closeNavDropdown();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNavDropdown();
});

navDropdown.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeNavDropdown);
});



// CART + ORDER MODAL
const cartCount     = document.getElementById('cart-count');
const cartBtn        = document.getElementById('cart-btn');
const cartDropdown   = document.getElementById('cart-dropdown');
const cartDropdownClose = document.getElementById('cart-dropdown-close');
const cartItemsList  = document.getElementById('cart-items-list');
const cartTotalEl    = document.getElementById('cart-total');
const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
const cartClearBtn   = document.getElementById('cart-clear-btn');
const whatsappBtn    = document.getElementById('whatsapp-btn');

const couponInput      = document.getElementById('coupon-input');
const couponApplyBtn   = document.getElementById('coupon-apply-btn');
const couponForm       = document.getElementById('coupon-form');
const couponApplied    = document.getElementById('coupon-applied');
const couponAppliedText = document.getElementById('coupon-applied-text');
const couponRemoveBtn  = document.getElementById('coupon-remove-btn');
const couponErrorEl    = document.getElementById('err-coupon');
const cartSubtotalEl   = document.getElementById('cart-subtotal');
const cartDiscountRow  = document.getElementById('cart-discount-row');
const cartDiscountLabel = document.getElementById('cart-discount-label');
const cartDiscountEl   = document.getElementById('cart-discount');
const cartDeliveryRow       = document.getElementById('cart-delivery-row');
const cartDeliveryZoneLabel = document.getElementById('cart-delivery-zone-label');
const cartDeliveryFeeEl     = document.getElementById('cart-delivery-fee');
const deliveryZoneSelect    = document.getElementById('delivery-zone-select');
const deliveryCheckBtn      = document.getElementById('delivery-check-btn');
const deliveryCheckResultEl = document.getElementById('delivery-check-result');

const overlay     = document.getElementById('modal-overlay');
const step1       = document.getElementById('modal-step-1');
const step2       = document.getElementById('modal-step-2');
const modalTitle  = document.getElementById('modal-title');
const modalPrice  = document.getElementById('modal-price');
const modalBadge  = document.getElementById('modal-badge');
const modalSubmitBtn = document.getElementById('modal-submit');

const cart = {};
let pendingItem = null; // { name, price, cakeId }
let lastOrder = null;   // the order object as returned by the API
let appliedCoupon = null;
let appliedDeliveryZone = null;

const DELIVERY_ZONES = {
  'Westlands': 0,
  'Parklands': 200,
  'CBD': 300,
  'Kilimani': 250,
  'Lavington': 250,
  'South B / South C': 400,
  'Karen': 500,
  'Runda': 500,
  'Kasarani': 600,
  'Ruaka': 600,
};

const CART_STORAGE_KEY = 'sweetbite_cart_state';

function saveCartState() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ cart, appliedCoupon, appliedDeliveryZone }));
  } catch {
  }
}

function loadCartState() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    if (saved && typeof saved.cart === 'object' && saved.cart !== null) {
      Object.assign(cart, saved.cart);
    }
    if (saved && saved.appliedCoupon) {
      appliedCoupon = saved.appliedCoupon;
    }
    if (saved && saved.appliedDeliveryZone) {
      appliedDeliveryZone = saved.appliedDeliveryZone;
    }
  } catch {
  }
}

function formatKES(amount) {
  return `KSh ${Math.round(amount).toLocaleString('en-KE')}`;
}

const COUPONS = {
  SWEET15: { type: 'percent', value: 15, label: '15% off' },
  WELCOME10: { type: 'percent', value: 10, label: '10% off' },
  SAVE5: { type: 'flat', value: 500, label: 'KSh 500 off' },
};

function setMinDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('order-date').min = tomorrow.toISOString().split('T')[0];
}

const CAKE_SIZE_MULTIPLIERS = { Small: 0.7, Medium: 1, Large: 1.5 };
const CAKE_FROSTING_ADDONS  = { 'Buttercream': 0, 'Chocolate Ganache': 500, 'Fresh Cream': 300 };
const CAKE_SIZE_SERVINGS    = { Small: 'serves 6–8', Medium: 'serves 10–12', Large: 'serves 15–20' };

const sizeOptionsEl     = document.getElementById('size-options');
const frostingOptionsEl = document.getElementById('frosting-options');

let selectedSize     = 'Medium';
let selectedFrosting = 'Buttercream';

// Client-side price preview only — shown in the modal while the person is
// still choosing options. The backend recomputes this same formula itself
// and that server-side number is the one actually charged/stored; this
// local copy just avoids a network round trip on every pill click.
function computeCurrentPrice() {
  if (!pendingItem) return 0;
  const sizeMult    = CAKE_SIZE_MULTIPLIERS[selectedSize] ?? 1;
  const frostingFee = CAKE_FROSTING_ADDONS[selectedFrosting] ?? 0;
  return Math.round(pendingItem.price * sizeMult) + frostingFee;
}

function updateModalPrice() {
  modalPrice.textContent = formatKES(computeCurrentPrice());
}

function setActivePill(row, key, value) {
  row.querySelectorAll('.option-pill').forEach(btn => {
    const isActive = btn.dataset[key] === value;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

sizeOptionsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.option-pill');
  if (!btn) return;
  selectedSize = btn.dataset.size;
  setActivePill(sizeOptionsEl, 'size', selectedSize);
  updateModalPrice();
});

frostingOptionsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.option-pill');
  if (!btn) return;
  selectedFrosting = btn.dataset.frosting;
  setActivePill(frostingOptionsEl, 'frosting', selectedFrosting);
  updateModalPrice();
});

function openModal(name, price, cakeId) {
  pendingItem = { name, price, cakeId };
  modalTitle.textContent  = name;
  selectedSize     = 'Medium';
  selectedFrosting = 'Buttercream';
  setActivePill(sizeOptionsEl, 'size', selectedSize);
  setActivePill(frostingOptionsEl, 'frosting', selectedFrosting);
  updateModalPrice();
  step1.classList.remove('hidden');
  step2.classList.add('hidden');
  clearErrors();
  document.getElementById('order-name').value    = '';
  document.getElementById('order-phone').value   = '';
  document.getElementById('order-address').value = '';
  document.getElementById('order-date').value    = '';
  document.getElementById('order-notes').value   = '';
  setMinDate();
  overlay.classList.add('open');
  setTimeout(() => {
    document.getElementById('order-name').focus();
    pushFocusTrap(document.getElementById('order-modal'));
  }, 250);
}

function closeModal() {
  overlay.classList.remove('open');
  pendingItem = null;
  popFocusTrap();
}

function clearErrors() {
  ['name','phone','address','date'].forEach(f => {
    document.getElementById(`err-${f}`).textContent = '';
    document.getElementById(`order-${f}`).classList.remove('invalid');
  });
}

function setError(field, msg) {
  document.getElementById(`err-${field}`).textContent = msg;
  document.getElementById(`order-${field}`).classList.add('invalid');
}

function validateForm() {
  clearErrors();
  let valid = true;
  const name    = document.getElementById('order-name').value.trim();
  const phone   = document.getElementById('order-phone').value.trim();
  const address = document.getElementById('order-address').value.trim();
  const date    = document.getElementById('order-date').value;

  if (!name)                          { setError('name', 'Please enter your full name.'); valid = false; }
  if (!phone)                         { setError('phone', 'Please enter a phone number.'); valid = false; }
  else if (!/^[\d\s\+\-\(\)]{7,}$/.test(phone)) { setError('phone', 'Enter a valid phone number.'); valid = false; }
  if (!address)                       { setError('address', 'Please enter a delivery address.'); valid = false; }
  if (!date)                          { setError('date', 'Please choose a delivery date.'); valid = false; }
  return valid;
}

// PRODUCT QUICK VIEW
const quickviewOverlay  = document.getElementById('quickview-overlay');
const quickviewModal    = document.getElementById('quickview-modal');
const quickviewImg      = document.getElementById('quickview-img');
const quickviewDots     = document.getElementById('quickview-dots');
const quickviewTag      = document.getElementById('quickview-tag');
const quickviewTitle    = document.getElementById('quickview-title');
const quickviewPrice    = document.getElementById('quickview-price');
const quickviewDesc     = document.getElementById('quickview-desc');
const quickviewReview     = document.getElementById('quickview-review');
const quickviewReviewText = document.getElementById('quickview-review-text');
const quickviewReviewName = document.getElementById('quickview-review-name');
const quickviewReviewRole = document.getElementById('quickview-review-role');
const quickviewReviewAvatar = document.getElementById('quickview-review-avatar');
const quickviewAddCart  = document.getElementById('quickview-add-cart');
const quickviewOrderNow = document.getElementById('quickview-order-now');
const quickviewPrev     = document.getElementById('quickview-prev');
const quickviewNext     = document.getElementById('quickview-next');

let quickviewImages = [];
let quickviewIndex  = 0;
let quickviewItem   = null; // { name, price, cakeId }

function renderQuickviewImage() {
  quickviewImg.src = quickviewImages[quickviewIndex];
  const cakeName = quickviewItem ? quickviewItem.name : 'cake';
  quickviewImg.alt = `${cakeName} — photo ${quickviewIndex + 1} of ${quickviewImages.length}`;
  quickviewDots.querySelectorAll('.quickview-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === quickviewIndex);
    dot.setAttribute('aria-pressed', i === quickviewIndex ? 'true' : 'false');
  });
}

function showQuickviewImage(delta) {
  quickviewIndex = (quickviewIndex + delta + quickviewImages.length) % quickviewImages.length;
  renderQuickviewImage();
}

function getInitials(fullName) {
  return fullName
    .split(/\s+/)
    .filter(w => /^[A-Za-z]/.test(w))
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function openQuickview(card) {
  const name     = card.querySelector('h3').textContent.trim();
  const orderBtnEl = card.querySelector('.order-btn');
  const price    = parseInt(orderBtnEl.dataset.price);
  const cakeId   = orderBtnEl.dataset.id ? parseInt(orderBtnEl.dataset.id) : null;
  const tag      = card.querySelector('.cake-tag')?.textContent.trim() || '';
  const fullDesc = card.dataset.fullDesc || card.querySelector('.cake-desc')?.textContent.trim() || '';
  quickviewImages = (card.dataset.images || '').split(',').filter(Boolean);
  if (quickviewImages.length === 0) {
    const fallbackImg = card.querySelector('.card-img-wrap img');
    if (fallbackImg) quickviewImages = [fallbackImg.src];
  }
  quickviewIndex = 0;
  quickviewItem  = { name, price, cakeId };

  quickviewTag.textContent   = tag;
  quickviewTitle.textContent = name;
  quickviewPrice.textContent = formatKES(price);
  quickviewDesc.textContent  = fullDesc;

  const reviewText = card.dataset.reviewText;
  if (reviewText) {
    quickviewReview.classList.remove('hidden');
    quickviewReviewText.textContent = `"${reviewText}"`;
    quickviewReviewName.textContent = card.dataset.reviewAuthor || '';
    quickviewReviewRole.textContent = card.dataset.reviewRole || '';
    quickviewReviewAvatar.textContent = getInitials(card.dataset.reviewAuthor || '');
    quickviewReviewAvatar.style.background = card.dataset.reviewColor || 'var(--primary)';
  } else {
    quickviewReview.classList.add('hidden');
  }

  quickviewDots.innerHTML = quickviewImages
    .map((_, i) => `<button type="button" class="quickview-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Photo ${i + 1}" aria-pressed="${i === 0 ? 'true' : 'false'}"></button>`)
    .join('');
  const multiplePhotos = quickviewImages.length > 1;
  quickviewPrev.style.display = multiplePhotos ? 'flex' : 'none';
  quickviewNext.style.display = multiplePhotos ? 'flex' : 'none';
  quickviewDots.style.display = multiplePhotos ? 'flex' : 'none';

  renderQuickviewImage();
  quickviewOverlay.classList.add('open');
  pushFocusTrap(quickviewModal);
}

function closeQuickview() {
  quickviewOverlay.classList.remove('open');
  popFocusTrap();
}

document.getElementById('quickview-close').addEventListener('click', closeQuickview);
quickviewOverlay.addEventListener('click', e => { if (e.target === quickviewOverlay) closeQuickview(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQuickview(); });

quickviewPrev.addEventListener('click', () => showQuickviewImage(-1));
quickviewNext.addEventListener('click', () => showQuickviewImage(1));
quickviewDots.addEventListener('click', (e) => {
  const dot = e.target.closest('.quickview-dot');
  if (!dot) return;
  quickviewIndex = parseInt(dot.dataset.index);
  renderQuickviewImage();
});

quickviewAddCart.addEventListener('click', () => {
  if (!quickviewItem) return;
  addToCart(quickviewItem.name, quickviewItem.price);
  showToast(`🛒 Added ${quickviewItem.name} to cart`);
  closeQuickview();
});

quickviewOrderNow.addEventListener('click', () => {
  if (!quickviewItem) return;
  closeQuickview();
  openModal(quickviewItem.name, quickviewItem.price, quickviewItem.cakeId);
});

// --- Cart dropdown rendering & cart state helpers ---
// NOTE: the cart/WhatsApp-checkout flow below is unchanged and still
// separate from the real order API — it's the "bundle several cakes into
// one WhatsApp message" path. The order MODAL (single-cake, with delivery
// details) is the flow now wired to POST /api/orders, below.

function cartItemCount() {
  return Object.values(cart).reduce((s, i) => s + i.qty, 0);
}

function updateCartCount() {
  cartCount.textContent = cartItemCount();
}

function bumpCartCount() {
  cartCount.classList.remove('bump');
  void cartCount.offsetWidth;
  cartCount.classList.add('bump');
  setTimeout(() => cartCount.classList.remove('bump'), 300);
}

function syncWhatsAppBadge() {
  whatsappBtn.classList.toggle('has-items', cartItemCount() > 0);
}

function calcSubtotal() {
  return Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
}

function calcDiscount(subtotal) {
  if (!appliedCoupon || subtotal <= 0) return 0;
  if (appliedCoupon.type === 'percent') {
    return Math.round(subtotal * (appliedCoupon.value / 100) * 100) / 100;
  }
  return Math.min(appliedCoupon.value, subtotal);
}

function renderCart() {
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    cartItemsList.innerHTML = `
      <div class="cart-empty">
        <p>🛒</p>
        <p>Your cart is empty</p>
        <p class="cart-empty-sub">Add a cake to get started!</p>
      </div>`;
    cartCheckoutBtn.disabled = true;
  } else {
    cartCheckoutBtn.disabled = false;
    cartItemsList.innerHTML = entries.map(([name, { price, qty }]) => `
      <div class="cart-item" data-name="${name}">
        <div class="cart-item-info">
          <p class="cart-item-name">${name}</p>
          <p class="cart-item-price">${formatKES(price)} each</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn qty-dec" aria-label="Decrease quantity of ${name}">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn qty-inc" aria-label="Increase quantity of ${name}">+</button>
        </div>
        <span class="cart-item-subtotal">${formatKES(price * qty)}</span>
        <button class="cart-item-remove" aria-label="Remove ${name} from cart">&times;</button>
      </div>`).join('');
  }

  const subtotal = calcSubtotal();
  const discount  = calcDiscount(subtotal);
  const deliveryFee = appliedDeliveryZone ? appliedDeliveryZone.fee : 0;
  const total     = Math.max(0, subtotal - discount) + deliveryFee;

  cartSubtotalEl.textContent = formatKES(subtotal);
  cartTotalEl.textContent    = formatKES(total);

  if (appliedCoupon && discount > 0) {
    cartDiscountRow.classList.remove('hidden');
    cartDiscountLabel.textContent = `Discount (${appliedCoupon.code})`;
    cartDiscountEl.textContent = `-${formatKES(discount)}`;
  } else {
    cartDiscountRow.classList.add('hidden');
  }

  if (appliedDeliveryZone) {
    cartDeliveryRow.classList.remove('hidden');
    cartDeliveryZoneLabel.textContent = appliedDeliveryZone.zone;
    cartDeliveryFeeEl.textContent = deliveryFee === 0 ? 'Free' : formatKES(deliveryFee);
  } else {
    cartDeliveryRow.classList.add('hidden');
  }
}

function addToCart(name, price, qty = 1) {
  if (cart[name]) cart[name].qty += qty;
  else cart[name] = { price, qty };

  updateCartCount();
  bumpCartCount();
  renderCart();
  syncWhatsAppBadge();
  saveCartState();
}

function openCartDropdown() {
  cartDropdown.classList.add('open');
  cartBtn.setAttribute('aria-expanded', 'true');
  pushFocusTrap(cartDropdown);
}

function closeCartDropdown() {
  cartDropdown.classList.remove('open');
  cartBtn.setAttribute('aria-expanded', 'false');
  popFocusTrap();
}

cartBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (cartDropdown.classList.contains('open')) closeCartDropdown();
  else openCartDropdown();
});

cartDropdownClose.addEventListener('click', closeCartDropdown);

document.addEventListener('click', (e) => {
  if (!cartDropdown.classList.contains('open')) return;
  if (cartDropdown.contains(e.target) || cartBtn.contains(e.target)) return;
  closeCartDropdown();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCartDropdown();
});

cartItemsList.addEventListener('click', (e) => {
  const itemEl = e.target.closest('.cart-item');
  if (!itemEl) return;
  const name = itemEl.dataset.name;
  if (!cart[name]) return;

  if (e.target.classList.contains('qty-inc')) {
    cart[name].qty++;
  } else if (e.target.classList.contains('qty-dec')) {
    cart[name].qty--;
    if (cart[name].qty <= 0) delete cart[name];
  } else if (e.target.classList.contains('cart-item-remove')) {
    delete cart[name];
  } else {
    return;
  }

  renderCart();
  updateCartCount();
  syncWhatsAppBadge();
  saveCartState();
});

cartClearBtn.addEventListener('click', () => {
  if (Object.keys(cart).length === 0 && !appliedCoupon) return;
  Object.keys(cart).forEach(k => delete cart[k]);
  removeCoupon(false);
  renderCart();
  updateCartCount();
  syncWhatsAppBadge();
  saveCartState();
  showToast('🗑️ Cart cleared');
});

function applyCoupon() {
  const code = couponInput.value.trim().toUpperCase();
  couponErrorEl.textContent = '';
  couponInput.classList.remove('invalid');

  if (!code) {
    couponErrorEl.textContent = 'Enter a coupon code.';
    couponInput.classList.add('invalid');
    return;
  }
  if (Object.keys(cart).length === 0) {
    couponErrorEl.textContent = 'Add a cake to your cart first.';
    return;
  }

  const coupon = COUPONS[code];
  if (!coupon) {
    couponErrorEl.textContent = 'Invalid or expired coupon code.';
    couponInput.classList.add('invalid');
    showToast('⚠️ That coupon code isn\'t valid.', 'error');
    return;
  }

  appliedCoupon = { code, ...coupon };
  couponInput.value = '';
  couponForm.classList.add('hidden');
  couponApplied.classList.remove('hidden');
  couponAppliedText.textContent = `✅ ${code} applied — ${coupon.label}`;
  renderCart();
  saveCartState();
  showToast(`🎉 Coupon ${code} applied!`);
}

function removeCoupon(notify = true) {
  appliedCoupon = null;
  couponApplied.classList.add('hidden');
  couponForm.classList.remove('hidden');
  couponErrorEl.textContent = '';
  couponInput.classList.remove('invalid');
  renderCart();
  saveCartState();
  if (notify) showToast('Coupon removed');
}

couponApplyBtn.addEventListener('click', applyCoupon);
couponInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    applyCoupon();
  }
});
couponRemoveBtn.addEventListener('click', () => removeCoupon(true));

function checkDeliveryZone() {
  const zone = deliveryZoneSelect.value;
  deliveryCheckResultEl.classList.remove('covered', 'not-covered');

  if (!zone) {
    deliveryCheckResultEl.textContent = 'Please select your area first.';
    deliveryCheckResultEl.classList.add('not-covered');
    return;
  }

  if (zone === '__other' || !(zone in DELIVERY_ZONES)) {
    appliedDeliveryZone = null;
    deliveryCheckResultEl.textContent = "😔 We don't currently deliver there — message us on WhatsApp and we'll see what we can arrange.";
    deliveryCheckResultEl.classList.add('not-covered');
    renderCart();
    saveCartState();
    return;
  }

  const fee = DELIVERY_ZONES[zone];
  appliedDeliveryZone = { zone, fee };
  deliveryCheckResultEl.textContent = fee === 0
    ? `✅ We deliver to ${zone} — delivery is free!`
    : `✅ We deliver to ${zone} — KSh ${fee.toLocaleString('en-KE')} delivery fee.`;
  deliveryCheckResultEl.classList.add('covered');
  renderCart();
  saveCartState();
}

deliveryCheckBtn.addEventListener('click', checkDeliveryZone);
deliveryZoneSelect.addEventListener('change', () => {
  deliveryCheckResultEl.textContent = '';
  deliveryCheckResultEl.classList.remove('covered', 'not-covered');
});

cartCheckoutBtn.addEventListener('click', () => {
  if (Object.keys(cart).length === 0) return;
  const msg = buildWhatsAppMessage();
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});

// SUBMIT ORDER — calls the real backend instead of writing to localStorage.
modalSubmitBtn.addEventListener('click', async () => {
  if (!validateForm()) return;
  if (!pendingItem || !pendingItem.cakeId) {
    showToast('⚠️ Something went wrong — please close this and try again.', 'error');
    return;
  }

  const name      = document.getElementById('order-name').value.trim();
  const phone     = document.getElementById('order-phone').value.trim();
  const address   = document.getElementById('order-address').value.trim();
  const dateInput = document.getElementById('order-date').value;
  const notes     = document.getElementById('order-notes').value.trim();

  const originalBtnText = modalSubmitBtn.textContent;
  modalSubmitBtn.disabled = true;
  modalSubmitBtn.textContent = 'Placing order…';

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cakeId: pendingItem.cakeId,
        size: selectedSize,
        frosting: selectedFrosting,
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        deliveryDate: dateInput,
        notes: notes || undefined,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `The order couldn't be placed (${res.status}).`);
    }

    const data = await res.json();
    lastOrder = data.order;

    // Also add to the WhatsApp-bundle cart, same as before, so the
    // existing "Order via WhatsApp" cart flow still reflects this cake.
    addToCart(lastOrder.cakeName, lastOrder.price);

    document.getElementById('confirm-order-id').textContent = lastOrder.orderNumber;

    const rows = [
      ['Cake',     lastOrder.cakeName],
      ['Size',     `${lastOrder.size} (${CAKE_SIZE_SERVINGS[lastOrder.size] || ''})`],
      ['Frosting', lastOrder.frosting],
      ['Price',    formatKES(lastOrder.price)],
      ['Name',     lastOrder.customerName],
      ['Phone',    lastOrder.customerPhone],
      ['Delivery', lastOrder.deliveryAddress],
      ['Date',     formatOrderDate(lastOrder.deliveryDate)],
    ];
    if (lastOrder.notes) rows.push(['Notes', lastOrder.notes]);

    document.getElementById('confirm-details').innerHTML = rows
      .map(([k, v]) => `<div class="confirm-row"><span>${k}</span><span>${v}</span></div>`)
      .join('');

    sendOrderWhatsAppConfirmation(lastOrder);

    step1.classList.add('hidden');
    step2.classList.remove('hidden');
  } catch (err) {
    console.error('Order submission failed:', err);
    showToast(`⚠️ ${err.message || 'Could not place the order. Please try again.'}`, 'error');
  } finally {
    modalSubmitBtn.disabled = false;
    modalSubmitBtn.textContent = originalBtnText;
  }
});

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-done').addEventListener('click', () => {
  closeModal();
  showToast(`🎉 Order for "${pendingItem?.name ?? 'your cake'}" confirmed!`);
});
document.getElementById('resend-wa-btn').addEventListener('click', () => {
  if (lastOrder) sendOrderWhatsAppConfirmation(lastOrder);
});
document.getElementById('modal-track-btn').addEventListener('click', () => {
  closeModal();
  if (lastOrder) {
    openTrackModal();
    document.getElementById('track-order-id').value = lastOrder.orderNumber;
    lookupOrder(lastOrder.orderNumber);
  }
});
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

loadCartState();
if (appliedCoupon) {
  couponForm.classList.add('hidden');
  couponApplied.classList.remove('hidden');
  couponAppliedText.textContent = `✅ ${appliedCoupon.code} applied — ${appliedCoupon.label}`;
}
if (appliedDeliveryZone) {
  deliveryZoneSelect.value = appliedDeliveryZone.zone;
  deliveryCheckResultEl.textContent = appliedDeliveryZone.fee === 0
    ? `✅ We deliver to ${appliedDeliveryZone.zone} — delivery is free!`
    : `✅ We deliver to ${appliedDeliveryZone.zone} — KSh ${appliedDeliveryZone.fee.toLocaleString('en-KE')} delivery fee.`;
  deliveryCheckResultEl.classList.add('covered');
}
renderCart();
updateCartCount();
syncWhatsAppBadge();


// WHATSAPP BUTTON
const WA_NUMBER = '254114593974';

function buildWhatsAppMessage() {
  const items = Object.entries(cart);
  if (items.length === 0) {
    return "Hi SweetBite! I'd like to enquire about your cakes.";
  }

  let msg = "Hi SweetBite! I'd like to place an order:\n\n";
  let subtotal = 0;

  items.forEach(([name, { price, qty }]) => {
    const lineTotal = price * qty;
    subtotal += lineTotal;
    msg += `• ${name} x${qty} — ${formatKES(lineTotal)}\n`;
  });

  const discount = calcDiscount(subtotal);
  const deliveryFee = appliedDeliveryZone ? appliedDeliveryZone.fee : 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  msg += `\nSubtotal: ${formatKES(subtotal)}`;
  if (appliedCoupon && discount > 0) {
    msg += `\nCoupon (${appliedCoupon.code}): -${formatKES(discount)}`;
  }
  if (appliedDeliveryZone) {
    msg += `\nDelivery (${appliedDeliveryZone.zone}): ${deliveryFee === 0 ? 'Free' : formatKES(deliveryFee)}`;
  }
  msg += `\n*Total: ${formatKES(total)}*`;
  msg += "\n\nPlease confirm availability and delivery details. Thank you!";
  return msg;
}

// Builds the WhatsApp confirmation message from a real API order object
// (orderNumber/cakeName/customerName/... field names, not the old
// localStorage shape).
function buildOrderWhatsAppMessage(order) {
  const dateStr = formatOrderDate(order.deliveryDate);

  let msg = "Hi SweetBite! I just placed an order — please confirm:\n\n";
  msg += `Order ID: ${order.orderNumber}\n`;
  msg += `Cake: ${order.cakeName}\n`;
  if (order.size)     msg += `Size: ${order.size} (${CAKE_SIZE_SERVINGS[order.size] || ''})\n`;
  if (order.frosting) msg += `Frosting: ${order.frosting}\n`;
  msg += `Price: ${formatKES(order.price)}\n`;
  msg += `Name: ${order.customerName}\n`;
  msg += `Phone: ${order.customerPhone}\n`;
  msg += `Delivery: ${order.deliveryAddress}\n`;
  msg += `Date: ${dateStr}\n`;
  if (order.notes) msg += `Notes: ${order.notes}\n`;
  msg += "\nLooking forward to your confirmation. Thank you!";
  return msg;
}

function sendOrderWhatsAppConfirmation(order) {
  if (!order) return;
  const msg = buildOrderWhatsAppMessage(order);
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

document.getElementById('whatsapp-btn').addEventListener('click', () => {
  const msg = buildWhatsAppMessage();
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});

// STICKY HEADER
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.style.background   = 'rgba(61, 36, 24, 1)';
    header.style.boxShadow    = '0 4px 16px rgba(0,0,0,0.12)';
  } else {
    header.style.background   = 'rgba(61, 36, 24, 0.96)';
    header.style.boxShadow    = '0 2px 12px rgba(0,0,0,0.08)';
  }
}, { passive: true });


// GALLERY + LIGHTBOX
const galleryItems  = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox      = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightbox-img');
const lightboxCap    = document.getElementById('lightbox-caption');
const lightboxClose  = document.getElementById('lightbox-close');
const lightboxPrev   = document.getElementById('lightbox-prev');
const lightboxNext   = document.getElementById('lightbox-next');

let currentGalleryIndex = 0;

function openLightbox(index) {
  currentGalleryIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
}

function renderLightbox() {
  const item = galleryItems[currentGalleryIndex];
  const img  = item.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCap.textContent = item.dataset.caption || img.alt || '';
}

function closeLightbox() {
  lightbox.classList.remove('open');
}

function showNext(delta) {
  currentGalleryIndex = (currentGalleryIndex + delta + galleryItems.length) % galleryItems.length;
  renderLightbox();
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showNext(-1));
lightboxNext.addEventListener('click', () => showNext(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showNext(-1);
  if (e.key === 'ArrowRight') showNext(1);
});


// FAQ ACCORDION
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  const wrap      = item.querySelector('.faq-answer-wrap');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer-wrap').style.maxHeight = null;
      }
    });

    if (isOpen) {
      item.classList.remove('open');
      wrap.style.maxHeight = null;
    } else {
      item.classList.add('open');
      wrap.style.maxHeight = wrap.scrollHeight + 'px';
    }
  });
});


// CONTACT FORM
const contactForm    = document.getElementById('contact-form');
const contactSuccess  = document.getElementById('contact-success');

function clearContactErrors() {
  ['contact-name', 'contact-email', 'contact-message'].forEach(id => {
    document.getElementById(`err-${id}`).textContent = '';
    document.getElementById(id).classList.remove('invalid');
  });
}

function setContactError(id, msg) {
  document.getElementById(`err-${id}`).textContent = msg;
  document.getElementById(id).classList.add('invalid');
}

const contactSubmitBtn = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearContactErrors();

  const name    = document.getElementById('contact-name').value.trim();
  const email   = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();
  let valid = true;

  if (!name)                     { setContactError('contact-name', 'Please enter your name.'); valid = false; }
  if (!email)                    { setContactError('contact-email', 'Please enter your email.'); valid = false; }
  else if (!isValidEmail(email)) { setContactError('contact-email', 'Enter a valid email address.'); valid = false; }
  if (!message)                  { setContactError('contact-message', 'Please write a short message.'); valid = false; }

  if (!valid) return;

  const originalBtnText = contactSubmitBtn.textContent;
  contactSubmitBtn.disabled = true;
  contactSubmitBtn.textContent = 'Sending…';

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Message couldn't be sent (${res.status}).`);
    }

    contactForm.classList.add('hidden');
    contactSuccess.classList.remove('hidden');
    showToast('💌 Message sent! We\'ll be in touch soon.');

    setTimeout(() => {
      contactForm.reset();
      contactForm.classList.remove('hidden');
      contactSuccess.classList.add('hidden');
    }, 4000);
  } catch (err) {
    console.error('Contact form submission failed:', err);
    showToast(`⚠️ ${err.message || 'Could not send your message. Please try again.'}`, 'error');
  } finally {
    contactSubmitBtn.disabled = false;
    contactSubmitBtn.textContent = originalBtnText;
  }
});


// ORDER TRACKING — now backed by GET /api/orders/:orderNumber instead of
// a localStorage-simulated timer. Polling re-fetches so a status change
// made elsewhere (e.g. a future staff dashboard calling the PATCH status
// endpoint) shows up here without the customer needing to refresh.
const TRACK_STAGE_KEYS = ['confirmed', 'baking', 'delivery', 'delivered'];
const TRACK_STAGE_MESSAGES = {
  confirmed: "Your order has been confirmed — we'll start baking soon! 📝",
  baking: "Good news — your cake is in the oven right now! 🧁",
  delivery: "Your cake is out for delivery and on its way! 🚚",
  delivered: "Delivered! We hope you enjoy every bite. 🎉",
  cancelled: "This order has been cancelled. Contact us on WhatsApp if that's unexpected.",
};
const TRACK_POLL_INTERVAL_MS = 8000;

// A plain 'YYYY-MM-DD' string (or one with a time part attached) is
// parsed at local midnight explicitly, avoiding the timezone pitfalls
// that come from letting the Date constructor interpret it as UTC.
function formatOrderDate(dateStr) {
  if (!dateStr) return '';
  const datePart = dateStr.split('T')[0];
  const d = new Date(datePart + 'T00:00:00');
  return d.toLocaleDateString('en-KE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

const trackOverlay     = document.getElementById('track-overlay');
const trackStepLookup  = document.getElementById('track-step-lookup');
const trackStepResult  = document.getElementById('track-step-result');
const trackInput       = document.getElementById('track-order-id');
const trackErrorEl     = document.getElementById('err-track-order-id');
const navTrackLink     = document.getElementById('nav-track-link');
let trackerPollInterval = null;
let trackedOrderNumber  = null;

function openTrackModal() {
  trackOverlay.classList.add('open');
  trackStepLookup.classList.remove('hidden');
  trackStepResult.classList.add('hidden');
  trackErrorEl.textContent = '';
  trackInput.classList.remove('invalid');
  setTimeout(() => {
    trackInput.focus();
    pushFocusTrap(document.getElementById('track-modal'));
  }, 250);
}

function closeTrackModal() {
  trackOverlay.classList.remove('open');
  clearInterval(trackerPollInterval);
  trackerPollInterval = null;
  trackedOrderNumber = null;
  popFocusTrap();
}

function renderTracker(order) {
  document.getElementById('track-result-id').textContent = order.orderNumber;
  document.getElementById('track-result-cake').textContent = order.cakeName;
  document.getElementById('track-result-eta').textContent = order.deliveryDate
    ? `Expected delivery: ${formatOrderDate(order.deliveryDate)}`
    : '';

  const stageIndex = TRACK_STAGE_KEYS.indexOf(order.status);
  const steps = trackStepResult.querySelectorAll('.tracker-step');
  const lines = trackStepResult.querySelectorAll('.tracker-line');

  if (order.status === 'cancelled') {
    // Nothing reads as "in progress" for a cancelled order — clear every
    // step rather than implying it's still confirmed/baking/etc.
    steps.forEach(stepEl => stepEl.classList.remove('completed', 'active'));
    lines.forEach(lineEl => lineEl.classList.remove('completed'));
  } else {
    steps.forEach((stepEl, i) => {
      stepEl.classList.remove('completed', 'active');
      if (i < stageIndex) stepEl.classList.add('completed');
      else if (i === stageIndex) stepEl.classList.add('active');
    });
    lines.forEach((lineEl, i) => {
      lineEl.classList.toggle('completed', i < stageIndex);
    });
  }

  document.getElementById('tracker-message').textContent =
    TRACK_STAGE_MESSAGES[order.status] || 'Checking your order status…';

  trackStepLookup.classList.add('hidden');
  trackStepResult.classList.remove('hidden');
}

function startTrackerPolling(orderNumber) {
  clearInterval(trackerPollInterval);
  trackedOrderNumber = orderNumber;
  trackerPollInterval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderNumber)}`);
      if (!res.ok) return; // order was removed or a transient error — just skip this tick
      const data = await res.json();
      if (trackedOrderNumber === orderNumber) renderTracker(data.order);
    } catch {
      // Network hiccup — try again on the next tick rather than surfacing an error.
    }
  }, TRACK_POLL_INTERVAL_MS);
}

async function lookupOrder(idStr) {
  trackErrorEl.textContent = '';
  trackInput.classList.remove('invalid');

  const id = (idStr || '').trim();
  if (!id) {
    trackErrorEl.textContent = 'Please enter an order ID.';
    trackInput.classList.add('invalid');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`);
    if (!res.ok) {
      trackErrorEl.textContent = 'No order found with that ID.';
      trackInput.classList.add('invalid');
      showToast('⚠️ Order not found.', 'error');
      return;
    }
    const data = await res.json();
    renderTracker(data.order);
    startTrackerPolling(data.order.orderNumber);
  } catch (err) {
    console.error('Order lookup failed:', err);
    trackErrorEl.textContent = "Couldn't check that order right now — try again in a moment.";
    trackInput.classList.add('invalid');
  }
}

navTrackLink.addEventListener('click', (e) => {
  e.preventDefault();
  setHamburgerOpen(false);
  closeNavDropdown();
  trackInput.value = '';
  openTrackModal();
});

document.getElementById('track-close').addEventListener('click', closeTrackModal);
trackOverlay.addEventListener('click', e => { if (e.target === trackOverlay) closeTrackModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTrackModal(); });

document.getElementById('track-lookup-btn').addEventListener('click', () => lookupOrder(trackInput.value));
trackInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    lookupOrder(trackInput.value);
  }
});

document.getElementById('track-another-btn').addEventListener('click', () => {
  clearInterval(trackerPollInterval);
  trackedOrderNumber = null;
  trackStepResult.classList.add('hidden');
  trackStepLookup.classList.remove('hidden');
  trackInput.value = '';
  trackErrorEl.textContent = '';
  trackInput.classList.remove('invalid');
  setTimeout(() => trackInput.focus(), 150);
});


// NEWSLETTER / DISCOUNT POPUP
const NEWSLETTER_SEEN_KEY = 'sweetbite_newsletter_seen';
const NEWSLETTER_DELAY_MS = 6000;
const NEWSLETTER_CODE     = 'WELCOME10';

const newsletterOverlay     = document.getElementById('newsletter-overlay');
const newsletterModal       = document.getElementById('newsletter-modal');
const newsletterStepForm    = document.getElementById('newsletter-step-form');
const newsletterStepSuccess = document.getElementById('newsletter-step-success');
const newsletterForm        = document.getElementById('newsletter-form');
const newsletterEmailInput  = document.getElementById('newsletter-email');
const newsletterEmailError  = document.getElementById('err-newsletter-email');
const newsletterCopyBtn     = document.getElementById('newsletter-copy-btn');

function hasSeenNewsletterPopup() {
  try {
    return localStorage.getItem(NEWSLETTER_SEEN_KEY) === '1';
  } catch {
    return true;
  }
}

function markNewsletterPopupSeen() {
  try {
    localStorage.setItem(NEWSLETTER_SEEN_KEY, '1');
  } catch {
  }
}

function anyOtherOverlayOpen() {
  return [overlay, trackOverlay, quickviewOverlay, lightbox].some(el => el && el.classList.contains('open'));
}

function openNewsletterPopup() {
  newsletterStepForm.classList.remove('hidden');
  newsletterStepSuccess.classList.add('hidden');
  newsletterEmailInput.value = '';
  newsletterEmailError.textContent = '';
  newsletterEmailInput.classList.remove('invalid');
  newsletterModal.setAttribute('aria-labelledby', 'newsletter-title');
  newsletterOverlay.classList.add('open');
  setTimeout(() => {
    newsletterEmailInput.focus();
    pushFocusTrap(newsletterModal);
  }, 250);
}

function closeNewsletterPopup() {
  newsletterOverlay.classList.remove('open');
  popFocusTrap();
}

setTimeout(() => {
  if (hasSeenNewsletterPopup() || anyOtherOverlayOpen()) return;
  openNewsletterPopup();
}, NEWSLETTER_DELAY_MS);

document.getElementById('newsletter-close').addEventListener('click', () => {
  markNewsletterPopupSeen();
  closeNewsletterPopup();
});
document.getElementById('newsletter-no-thanks').addEventListener('click', () => {
  markNewsletterPopupSeen();
  closeNewsletterPopup();
});
newsletterOverlay.addEventListener('click', e => {
  if (e.target === newsletterOverlay) {
    markNewsletterPopupSeen();
    closeNewsletterPopup();
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && newsletterOverlay.classList.contains('open')) {
    markNewsletterPopupSeen();
    closeNewsletterPopup();
  }
});

newsletterForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = newsletterEmailInput.value.trim();
  newsletterEmailError.textContent = '';
  newsletterEmailInput.classList.remove('invalid');

  if (!email) {
    newsletterEmailError.textContent = 'Please enter your email.';
    newsletterEmailInput.classList.add('invalid');
    return;
  }
  if (!isValidEmail(email)) {
    newsletterEmailError.textContent = 'Enter a valid email address.';
    newsletterEmailInput.classList.add('invalid');
    return;
  }

  markNewsletterPopupSeen();
  newsletterStepForm.classList.add('hidden');
  newsletterStepSuccess.classList.remove('hidden');
  newsletterModal.setAttribute('aria-labelledby', 'newsletter-success-title');
  showToast('🎉 You\'re subscribed!');
});

newsletterCopyBtn.addEventListener('click', () => {
  const finish = () => showToast('📋 Code copied!');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(NEWSLETTER_CODE).then(finish).catch(finish);
  } else {
    finish();
  }
});

document.getElementById('newsletter-done-btn').addEventListener('click', () => {
  closeNewsletterPopup();
});


// DYNAMIC CAKE RENDERING — fetches the live menu from the backend API
// instead of relying on hardcoded cards.
//
// Change API_BASE to your deployed backend URL once sweetbite-api is
// hosted somewhere other than your own machine (Render/Railway/etc).
const API_BASE = 'https://sweetbites-app.onrender.com/api';

const pricingContainer = document.querySelector('.pricing-container');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function buildCakeCardHTML(cake) {
  const images = [cake.imageUrl, ...(cake.galleryUrls || [])].filter(Boolean);
  const badgeHTML = cake.badge === 'popular'
    ? '<span class="badge popular">Popular</span>'
    : cake.badge === 'new'
      ? '<span class="badge new-badge">New</span>'
      : '';

  return `
    <div class="price-card" data-tag="${escapeHtml(cake.tag)}" data-images="${escapeHtml(images.join(','))}" data-full-desc="${escapeHtml(cake.fullDesc)}">
      <div class="card-img-wrap">
        ${badgeHTML}
        <span class="card-view-hint">🔍 Quick view</span>
        <img src="${escapeHtml(cake.imageUrl)}" width="600" height="450" alt="${escapeHtml(cake.name)}">
      </div>
      <div class="card-body">
        <span class="cake-tag">${escapeHtml(cake.tag)}</span>
        <h3>${escapeHtml(cake.name)}</h3>
        <p class="cake-desc">${escapeHtml(cake.shortDesc)}</p>
        <div class="card-footer">
          <span class="cake-price">${formatKES(cake.price)}</span>
          <div class="card-footer-actions">
            <button class="quick-add-btn" data-name="${escapeHtml(cake.name)}" data-price="${cake.price}" data-id="${cake.id}" aria-label="Add ${escapeHtml(cake.name)} to cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 7H6"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
            </button>
            <button class="order-btn" data-name="${escapeHtml(cake.name)}" data-price="${cake.price}" data-id="${cake.id}">Order Now</button>
          </div>
        </div>
      </div>
    </div>`;
}

async function loadCakes() {
  pricingContainer.innerHTML = '<p class="cake-filter-empty">Loading our cake collection…</p>';

  try {
    const res = await fetch(`${API_BASE}/cakes`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    const cakes = data.cakes || [];

    if (cakes.length === 0) {
      pricingContainer.innerHTML = '<p class="cake-filter-empty">No cakes available right now — check back soon!</p>';
      return;
    }

    pricingContainer.innerHTML = cakes.map(buildCakeCardHTML).join('');

    pricingContainer.querySelectorAll('.price-card').forEach(card => revealObserver.observe(card));
    applyCakeFilter();
  } catch (err) {
    console.error('Failed to load cakes:', err);
    pricingContainer.innerHTML = `
      <p class="cake-filter-empty">
        Couldn't load the cake menu right now. Make sure the backend server is running
        (npm run dev in sweetbite-api), then refresh this page.
      </p>`;
  }
}

pricingContainer.addEventListener('click', (e) => {
  const orderBtn = e.target.closest('.order-btn');
  if (orderBtn) {
    e.stopPropagation();
    const cakeId = orderBtn.dataset.id ? parseInt(orderBtn.dataset.id) : null;
    openModal(orderBtn.dataset.name, parseInt(orderBtn.dataset.price), cakeId);
    return;
  }

  const quickAddBtn = e.target.closest('.quick-add-btn');
  if (quickAddBtn) {
    e.stopPropagation();
    const name = quickAddBtn.dataset.name;
    const price = parseInt(quickAddBtn.dataset.price);
    addToCart(name, price);
    showToast(`🛒 Added ${name} to cart`);
    return;
  }

  const card = e.target.closest('.price-card');
  if (card) {
    openQuickview(card);
  }
});

loadCakes();