const API_BASE = 'https://sweetbites-app.onrender.com/api';
const AUTH_STORAGE_KEY = 'sweetbite_auth';

// TOAST (same pattern as the main site)
const toast = document.getElementById('toast');
let toastTimer;
function showToast(message, type = 'success') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = 'show' + (type === 'error' ? ' error' : '');
  toastTimer = setTimeout(() => { toast.className = ''; }, 3500);
}

// DARK MODE — respect whatever the visitor already had set on the main site.
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// ACCESS CONTROL
// This is a UI convenience only — every real protection happens server-side
// via requireAdmin on the API itself. A non-admin who somehow gets past
// this check still gets 403s from every fetch below.
let authToken = null;
let currentUser = null;

function loadAuthState() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    if (saved && saved.token && saved.user) {
      authToken = saved.token;
      currentUser = saved.user;
    }
  } catch {
  }
}

const dashChecking = document.getElementById('dash-checking');
const dashDenied = document.getElementById('dash-denied');
const dashMain = document.getElementById('dash-main');
const dashUserName = document.getElementById('dash-user-name');

function checkAccess() {
  loadAuthState();
  dashChecking.classList.add('hidden');

  if (!currentUser || currentUser.role !== 'admin') {
    dashDenied.classList.remove('hidden');
    return false;
  }

  dashUserName.textContent = currentUser.name;
  dashMain.classList.remove('hidden');
  return true;
}

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` };
}

// TABS
const dashTabs = document.querySelectorAll('.dash-tab');
const dashPanels = {
  orders: document.getElementById('dash-panel-orders'),
  messages: document.getElementById('dash-panel-messages'),
};

dashTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    dashTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    Object.entries(dashPanels).forEach(([key, panel]) => {
      panel.classList.toggle('hidden', key !== tab.dataset.tab);
    });
  });
});

// ORDERS
const ordersList = document.getElementById('orders-list');
const ordersFilterRow = document.getElementById('orders-filter-row');
let currentOrderStatusFilter = '';

const STATUS_LABELS = {
  confirmed: 'Confirmed',
  baking: 'Baking',
  delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatDashDate(dateStr) {
  if (!dateStr) return '';
  const datePart = dateStr.split('T')[0];
  const d = new Date(datePart + 'T00:00:00');
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Safe for text content AND quoted attribute values (the old
// textContent/innerHTML trick left quotes untouched).
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatKES(amount) {
  return `KSh ${Math.round(amount).toLocaleString('en-KE')}`;
}

function buildOrderCardHTML(order) {
  return `
    <div class="dash-order-card" data-order-number="${escapeHtml(order.orderNumber)}">
      <div class="dash-order-main">
        <span class="dash-order-number">${escapeHtml(order.orderNumber)}</span>
        <span class="dash-status-pill dash-status-${escapeHtml(order.status)}">${escapeHtml(STATUS_LABELS[order.status] || order.status)}</span>
        <p class="dash-order-cake">${escapeHtml(order.cakeName)} — ${escapeHtml(order.size)}, ${escapeHtml(order.frosting)}</p>
        <p class="dash-order-meta">
          ${escapeHtml(order.customerName)} · ${escapeHtml(order.customerPhone)}<br>
          ${escapeHtml(order.deliveryAddress)}<br>
          Delivery: ${formatDashDate(order.deliveryDate)} · ${formatKES(order.price)}
          ${order.notes ? `<br>Notes: ${escapeHtml(order.notes)}` : ''}
        </p>
      </div>
      <select class="dash-order-status-select" data-order-number="${escapeHtml(order.orderNumber)}">
        ${Object.entries(STATUS_LABELS).map(([value, label]) =>
          `<option value="${value}" ${value === order.status ? 'selected' : ''}>${label}</option>`
        ).join('')}
      </select>
    </div>`;
}

async function loadOrders() {
  ordersList.innerHTML = '<p class="dash-empty">Loading orders…</p>';
  try {
    const url = new URL(`${API_BASE}/orders`);
    if (currentOrderStatusFilter) url.searchParams.set('status', currentOrderStatusFilter);

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    const orders = data.orders || [];

    if (orders.length === 0) {
      ordersList.innerHTML = '<p class="dash-empty">No orders here yet.</p>';
      return;
    }

    ordersList.innerHTML = orders.map(buildOrderCardHTML).join('');
  } catch (err) {
    console.error('Failed to load orders:', err);
    ordersList.innerHTML = '<p class="dash-empty">Could not load orders. Try refreshing the page.</p>';
  }
}

ordersFilterRow.addEventListener('click', (e) => {
  const btn = e.target.closest('.dash-filter-btn');
  if (!btn) return;
  currentOrderStatusFilter = btn.dataset.status;
  ordersFilterRow.querySelectorAll('.dash-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadOrders();
});

ordersList.addEventListener('change', async (e) => {
  const select = e.target.closest('.dash-order-status-select');
  if (!select) return;

  const orderNumber = select.dataset.orderNumber;
  const newStatus = select.value;

  select.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderNumber)}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    showToast(`${orderNumber} updated to "${STATUS_LABELS[newStatus]}"`);
    loadOrders();
  } catch (err) {
    console.error('Failed to update order status:', err);
    showToast('Could not update that order. Please try again.', 'error');
    loadOrders();
  } finally {
    select.disabled = false;
  }
});

// MESSAGES
const messagesList = document.getElementById('messages-list');
const dashUnreadCount = document.getElementById('dash-unread-count');
let currentUnreadFilter = '';

function buildMessageCardHTML(msg) {
  const date = new Date(msg.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `
    <div class="dash-message-card ${msg.isRead ? '' : 'unread'}" data-id="${msg.id}">
      <div class="dash-message-top">
        <div>
          <p class="dash-message-from">${escapeHtml(msg.name)}</p>
          <p class="dash-message-email">${escapeHtml(msg.email)}</p>
        </div>
        <span class="dash-message-date">${date}</span>
      </div>
      <p class="dash-message-body">${escapeHtml(msg.message)}</p>
      <div class="dash-message-actions">
        ${!msg.isRead ? `<button type="button" class="dash-msg-btn dash-msg-read" data-id="${msg.id}">Mark read</button>` : ''}
        <button type="button" class="dash-msg-btn dash-msg-delete" data-id="${msg.id}">Delete</button>
      </div>
    </div>`;
}

async function loadMessages() {
  messagesList.innerHTML = '<p class="dash-empty">Loading messages…</p>';
  try {
    const url = new URL(`${API_BASE}/contact`);
    if (currentUnreadFilter) url.searchParams.set('unread', currentUnreadFilter);

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    const messages = data.messages || [];

    const unreadTotal = messages.filter(m => !m.isRead).length;
    dashUnreadCount.textContent = unreadTotal;
    dashUnreadCount.classList.toggle('hidden', unreadTotal === 0);

    if (messages.length === 0) {
      messagesList.innerHTML = '<p class="dash-empty">No messages here.</p>';
      return;
    }

    messagesList.innerHTML = messages.map(buildMessageCardHTML).join('');
  } catch (err) {
    console.error('Failed to load messages:', err);
    messagesList.innerHTML = '<p class="dash-empty">Could not load messages. Try refreshing the page.</p>';
  }
}

document.querySelectorAll('#dash-panel-messages .dash-filter-row .dash-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentUnreadFilter = btn.dataset.unread;
    btn.parentElement.querySelectorAll('.dash-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadMessages();
  });
});

messagesList.addEventListener('click', async (e) => {
  const readBtn = e.target.closest('.dash-msg-read');
  const deleteBtn = e.target.closest('.dash-msg-delete');

  if (readBtn) {
    try {
      const res = await fetch(`${API_BASE}/contact/${readBtn.dataset.id}/read`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      loadMessages();
    } catch (err) {
      console.error('Failed to mark message read:', err);
      showToast('Could not update that message.', 'error');
    }
    return;
  }

  if (deleteBtn) {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE}/contact/${deleteBtn.dataset.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      showToast('Message deleted.');
      loadMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
      showToast('Could not delete that message.', 'error');
    }
  }
});

// INIT
if (checkAccess()) {
  loadOrders();
  loadMessages();
}