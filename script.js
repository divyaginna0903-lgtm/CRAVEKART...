/* ============ DATA ============ */
const MENU = [
  { id: 1,  name: "Samosa",        cat: "Snacks",    price: 15, prep: 3, e: "🥟", type: "food" },
  { id: 2,  name: "Masala Chai",   cat: "Beverages", price: 10, prep: 2, e: "🍵", type: "drink" },
  { id: 3,  name: "Maggi",         cat: "Snacks",    price: 40, prep: 5, e: "🍜", type: "food" },
  { id: 4,  name: "Cold Coffee",   cat: "Beverages", price: 40, prep: 3, e: "🧋", type: "drink", ice: true },
  { id: 5,  name: "Veg Puff",      cat: "Snacks",    price: 20, prep: 2, e: "🥐", type: "food" },
  { id: 6,  name: "Veg Sandwich",  cat: "Snacks",    price: 35, prep: 4, e: "🥪", type: "food" },
  { id: 7,  name: "Masala Dosa",   cat: "Meals",     price: 60, prep: 8, e: "🌯", type: "food" },
  { id: 8,  name: "Idli Sambar",   cat: "Breakfast", price: 30, prep: 4, e: "🍚", type: "food" },
  { id: 9,  name: "Poha",          cat: "Breakfast", price: 25, prep: 3, e: "🥣", type: "food" },
  { id: 10, name: "Upma",          cat: "Breakfast", price: 25, prep: 3, e: "🍲", type: "food" },
  { id: 11, name: "Bread Omelette",cat: "Breakfast", price: 30, prep: 5, e: "🍳", type: "food" },
  { id: 12, name: "Veg Burger",    cat: "Snacks",    price: 45, prep: 5, e: "🍔", type: "food" },
  { id: 13, name: "French Fries",  cat: "Snacks",    price: 40, prep: 4, e: "🍟", type: "food" },
  { id: 14, name: "Paneer Roll",   cat: "Meals",     price: 70, prep: 6, e: "🌮", type: "food" },
  { id: 15, name: "Veg Fried Rice",cat: "Meals",     price: 80, prep: 8, e: "🍛", type: "food" },
  { id: 16, name: "Filter Coffee", cat: "Beverages", price: 15, prep: 2, e: "☕", type: "drink" },
  { id: 17, name: "Lemon Soda",    cat: "Beverages", price: 25, prep: 2, e: "🍋", type: "drink" },
  { id: 18, name: "Mango Shake",   cat: "Beverages", price: 50, prep: 3, e: "🥭", type: "drink", ice: true },
  { id: 19, name: "Cold Drink",    cat: "Beverages", price: 20, prep: 1, e: "🥤", type: "drink" },
  { id: 20, name: "Vada Pav",      cat: "Snacks",    price: 20, prep: 3, e: "🥙", type: "food" },
];
const SIZES = [{ name: "Regular", price: 0 }, { name: "Large", price: 10 }];
const MILKS = [{ name: "Regular Milk", price: 0 }, { name: "Oat Milk", price: 10 }, { name: "Soy Milk", price: 10 }];
const FOOD_ADDONS = [{ name: "Extra Cheese", price: 15 }, { name: "Extra Butter", price: 10 }, { name: "Extra Spicy", price: 0 }];
const DRINK_ADDONS = [{ name: "Less Sugar", price: 0 }, { name: "Extra Sugar", price: 0 }];
const ICE_ADDON = { name: "Extra Ice Cream", price: 15 };

/* ============ SHARED STATE (localStorage) ============ */
const KEY = "brewboard_state_v1";
const MY_KEY = "brewboard_my_order";
const defaultState = () => ({ lastToken: 27, orders: [], soldOut: {}, wallet: 150 });
function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) || defaultState(); }
  catch { return defaultState(); }
}
let S = loadState();
const saveState = () => localStorage.setItem(KEY, JSON.stringify(S));

/* ============ HELPERS ============ */
const $ = (id) => document.getElementById(id);
const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");
let toastTimer;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; show(t);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => hide(t), 2200);
}

/* ============ NAVIGATION ============ */
let currentView = "order";
document.querySelectorAll(".tab").forEach((b) =>
  b.addEventListener("click", () => {
    currentView = b.dataset.view;
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === b));
    ["order", "wall", "kot"].forEach((v) => $("view-" + v).classList.toggle("hidden", v !== currentView));
    renderAll();
  })
);

/* ============ MENU ============ */
let activeCat = "All";
function renderCategories() {
  const cats = ["All", ...new Set(MENU.map((m) => m.cat))];
  $("categories").innerHTML = cats
    .map((c) => `<button class="cat ${c === activeCat ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
  document.querySelectorAll(".cat").forEach((b) =>
    b.addEventListener("click", () => { activeCat = b.dataset.cat; renderCategories(); renderMenu(); })
  );
}
function renderMenu() {
  const list = MENU.filter((m) => activeCat === "All" || m.cat === activeCat);
  $("menuGrid").innerHTML = list.map((m) => {
    const sold = S.soldOut[m.id];
    return `<div class="card ${sold ? "sold" : ""}">
      ${sold ? '<span class="soldtag">SOLD OUT</span>' : ""}
      <div class="emoji">${m.e}</div>
      <h3>${m.name}</h3>
      <div class="meta">⏱ ${m.prep} min</div>
      <div class="price">₹${m.price}</div>
      <button class="quick" data-quick="${m.id}">+ Add</button>
      <button class="cust" data-cust="${m.id}">Customize</button>
    </div>`;
  }).join("");
  document.querySelectorAll("[data-quick]").forEach((b) =>
    b.addEventListener("click", () => {
      const item = MENU.find((m) => m.id == b.dataset.quick);
      addToCart(item, defaultOpts(item), 1);
      toast(`${item.name} added`);
    })
  );
  document.querySelectorAll("[data-cust]").forEach((b) =>
    b.addEventListener("click", () => openCustomizer(MENU.find((m) => m.id == b.dataset.cust)))
  );
}
const defaultOpts = (item) => (item.type === "drink" ? { size: SIZES[0], milk: MILKS[0], addons: [] } : { addons: [] });

/* ============ CUSTOMIZER ============ */
let cm = null;
function openCustomizer(item) {
  cm = { item, qty: 1, opts: defaultOpts(item) };
  $("cmTitle").textContent = `${item.e} ${item.name}`;
  drawCustomizer();
  show($("customModal"));
}
function optsPrice(o) {
  return (o.size ? o.size.price : 0) + (o.milk ? o.milk.price : 0) + o.addons.reduce((s, a) => s + a.price, 0);
}
function drawCustomizer() {
  const { item, opts } = cm;
  let html = "";
  if (item.type === "drink") {
    html += group("Size", SIZES, (s) => opts.size.name === s.name, "size");
    html += group("Milk", MILKS, (s) => opts.milk.name === s.name, "milk");
  }
  const addons = item.type === "drink" ? [...DRINK_ADDONS, ...(item.ice ? [ICE_ADDON] : [])] : FOOD_ADDONS;
  html += group("Add-ons", addons, (a) => opts.addons.some((x) => x.name === a.name), "addon");
  $("cmBody").innerHTML = html;
  $("cmBody").querySelectorAll("[data-k]").forEach((b) =>
    b.addEventListener("click", () => {
      const list = b.dataset.k === "size" ? SIZES : b.dataset.k === "milk" ? MILKS : addons;
      const choice = list[+b.dataset.i];
      if (b.dataset.k === "size") opts.size = choice;
      else if (b.dataset.k === "milk") opts.milk = choice;
      else {
        const idx = opts.addons.findIndex((x) => x.name === choice.name);
        idx >= 0 ? opts.addons.splice(idx, 1) : opts.addons.push(choice);
      }
      drawCustomizer();
    })
  );
  $("cmQty").textContent = cm.qty;
  $("cmAdd").textContent = `Add to Cart · ₹${(item.price + optsPrice(opts)) * cm.qty}`;
}
function group(title, list, isSel, k) {
  return `<div class="opt-group"><h4>${title}</h4><div class="opt-row">${list.map((o, i) =>
    `<button class="opt ${isSel(o) ? "sel" : ""}" data-k="${k}" data-i="${i}">${o.name}${o.price ? ` +₹${o.price}` : ""}</button>`
  ).join("")}</div></div>`;
}
$("cmMinus").onclick = () => { cm.qty = Math.max(1, cm.qty - 1); drawCustomizer(); };
$("cmPlus").onclick = () => { cm.qty = Math.min(20, cm.qty + 1); drawCustomizer(); };
$("cmAdd").onclick = () => {
  addToCart(cm.item, cm.opts, cm.qty);
  hide($("customModal")); toast(`${cm.item.name} added`);
};

/* ============ CART ============ */
let cart = [];
function optLabel(o) {
  const parts = [];
  if (o.size) parts.push(o.size.name);
  if (o.milk && o.milk.price) parts.push(o.milk.name);
  o.addons.forEach((a) => parts.push(a.name));
  return parts.join(", ");
}
function addToCart(item, opts, qty) {
  const sig = item.id + "|" + optLabel(opts);
  const line = cart.find((l) => l.sig === sig);
  if (line) line.qty += qty;
  else cart.push({ sig, item, opts: JSON.parse(JSON.stringify(opts)), qty, unit: item.price + optsPrice(opts) });
  renderCart();
}
const cartTotal = () => cart.reduce((s, l) => s + l.unit * l.qty, 0);
function renderCart() {
  const count = cart.reduce((s, l) => s + l.qty, 0);
  $("cartCount").textContent = count;
  $("cartTotal").textContent = cartTotal();
  $("cartTotalTop").textContent = cartTotal();
  $("cartItems").innerHTML = cart.length
    ? cart.map((l, i) => `<div class="cart-line">
        <div><b>${l.item.e} ${l.item.name}</b>
          <div class="opts">${optLabel(l.opts) || "Standard"}</div>
          <div class="mini-qty"><button data-dec="${i}">−</button><span>${l.qty}</span><button data-inc="${i}">+</button></div>
        </div><b>₹${l.unit * l.qty}</b></div>`).join("")
    : '<p class="muted">Cart is empty. Tap items to add.</p>';
  document.querySelectorAll("[data-inc]").forEach((b) => (b.onclick = () => { cart[+b.dataset.inc].qty++; renderCart(); }));
  document.querySelectorAll("[data-dec]").forEach((b) => (b.onclick = () => {
    const l = cart[+b.dataset.dec]; l.qty--; if (l.qty <= 0) cart.splice(+b.dataset.dec, 1); renderCart();
  }));
  $("quickPayBtn").disabled = !cart.length;
}
function openDrawer() { $("drawer").classList.add("open"); show($("backdrop")); buildSlots(); }
function closeDrawer() { $("drawer").classList.remove("open"); hide($("backdrop")); }
$("cartBtn").onclick = openDrawer;
$("closeDrawer").onclick = closeDrawer;
$("backdrop").onclick = closeDrawer;

function buildSlots() {
  const sel = $("slotSelect"); const prev = sel.value;
  const opts = ['<option value="now">As soon as possible</option>'];
  const now = new Date();
  let t = new Date(now); t.setMinutes(Math.ceil((now.getMinutes() + 10) / 15) * 15, 0, 0);
  for (let i = 0; i < 8; i++) {
    const label = t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    opts.push(`<option value="${label}">Pickup at ${label}</option>`);
    t = new Date(t.getTime() + 15 * 60000);
  }
  sel.innerHTML = opts.join(""); if (prev) sel.value = prev;
}

/* ============ PAYMENT ============ */
let payMethod = "upi", paying = false;
$("quickPayBtn").onclick = () => {
  if (!cart.length) return;
  closeDrawer(); payMethod = "upi"; paying = false;
  $("payAmount").textContent = cartTotal();
  $("payWalletBal").textContent = S.wallet;
  $("payStatus").textContent = "";
  $("payNowBtn").disabled = false; $("payNowBtn").textContent = "Pay Now";
  setPayTab("upi"); drawQR(); show($("payModal"));
};
document.querySelectorAll(".ptab").forEach((b) => (b.onclick = () => setPayTab(b.dataset.pay)));
function setPayTab(m) {
  payMethod = m;
  document.querySelectorAll(".ptab").forEach((x) => x.classList.toggle("active", x.dataset.pay === m));
  $("payUpi").classList.toggle("hidden", m !== "upi");
  $("payWallet").classList.toggle("hidden", m !== "wallet");
  $("payNowBtn").textContent = m === "upi" ? "Pay Now" : "Tap to Pay with Wallet";
}
function drawQR() { // decorative mock QR
  const c = $("qrCanvas"), x = c.getContext("2d"), n = 25, s = c.width / n;
  x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.fillStyle = "#000";
  let seed = cartTotal() * 7919 + Date.now() % 1000;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const inFinder = (i, j) => (i < 8 && j < 8) || (i >= n - 8 && j < 8) || (i < 8 && j >= n - 8);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
    if (!inFinder(i, j) && rnd() > 0.5) x.fillRect(i * s, j * s, s, s);
  [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([i, j]) => {
    x.fillStyle = "#000"; x.fillRect(i * s, j * s, 7 * s, 7 * s);
    x.fillStyle = "#fff"; x.fillRect((i + 1) * s, (j + 1) * s, 5 * s, 5 * s);
    x.fillStyle = "#000"; x.fillRect((i + 2) * s, (j + 2) * s, 3 * s, 3 * s);
  });
}
$("payNowBtn").onclick = () => {
  if (paying) return;
  if (payMethod === "wallet" && S.wallet < cartTotal()) { $("payStatus").textContent = "Insufficient wallet balance. Top up or use UPI."; return; }
  paying = true; $("payNowBtn").disabled = true;
  $("payStatus").textContent = payMethod === "upi" ? "Waiting for UPI confirmation…" : "Reading card…";
  setTimeout(() => { $("payStatus").textContent = "✅ Payment received"; }, 1200);
  setTimeout(completeOrder, 2000);
};
$("topupBtn").onclick = () => { S = loadState(); S.wallet += 100; saveState(); renderWallet(); toast("₹100 added to wallet"); };

/* ============ ORDER + TOKEN ============ */
function completeOrder() {
  S = loadState(); // get latest token counter
  const total = cartTotal();
  if (payMethod === "wallet") S.wallet -= total;
  S.lastToken += 1;
  const queueLoad = S.orders.filter((o) => o.status === "preparing").length;
  const order = {
    id: Date.now(),
    token: "B-" + S.lastToken,
    items: cart.map((l) => ({ name: l.item.name, emoji: l.item.e, qty: l.qty, opts: optLabel(l.opts) })),
    total, status: "preparing",
    slot: $("slotSelect").value,
    eta: Math.max(...cart.map((l) => l.item.prep)) + Math.min(queueLoad, 5),
    createdAt: Date.now(),
  };
  S.orders.push(order); saveState();
  localStorage.setItem(MY_KEY, JSON.stringify({ id: order.id })); // cached token
  cart = []; renderCart(); hide($("payModal"));
  openReceipt(); renderAll();
}

/* ============ RECEIPT ============ */
function myOrder() {
  const my = JSON.parse(localStorage.getItem(MY_KEY) || "null");
  return my ? S.orders.find((o) => o.id === my.id) || my.snapshot : null;
}
function openReceipt() {
  const o = myOrder();
  if (!o) return toast("No active token");
  drawReceipt(o); show($("receiptModal"));
}
function drawReceipt(o) {
  $("rcToken").textContent = "#" + o.token;
  const ready = o.status === "ready" || o.status === "collected";
  $("rcStatus").className = "status-pill" + (ready ? " ready" : "");
  $("rcStatus").textContent = o.status === "collected" ? "Collected" : ready ? "✅ Ready for Pickup!" : "👨‍🍳 Preparing";
  $("rcEta").textContent = ready ? "Please collect at Counter 1" : `Estimated time: ~${o.eta} min${o.slot !== "now" ? ` · Pickup slot ${o.slot}` : ""}`;
  $("rcItems").innerHTML = o.items.map((i) => `<li>${i.emoji} ${i.qty}× ${i.name}${i.opts ? ` <span class="muted small">(${i.opts})</span>` : ""}</li>`).join("") +
    `<li><b>Total paid: ₹${o.total}</b></li>`;
}
$("myTokenBtn").onclick = openReceipt;
function renderMyToken() {
  const o = myOrder();
  $("myTokenBtn").classList.toggle("hidden", !o || o.status === "collected");
  if (o) $("myTokenBtn").textContent = "🎫 #" + o.token + (o.status === "ready" ? " READY" : "");
  if (!$("receiptModal").classList.contains("hidden") && o) drawReceipt(o);
}

/* close buttons for modals */
document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => b.closest(".modal").classList.add("hidden")));

/* ============ WALL SCREEN ============ */
let soundOn = false, announced = new Set(), wallInit = false;
$("soundBtn").onclick = () => {
  soundOn = !soundOn;
  $("soundBtn").textContent = soundOn ? "🔊 Sound On" : "🔇 Enable Sound";
  if (soundOn) chime();
};
function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1175].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.4);
      o.start(ctx.currentTime + i * 0.25); o.stop(ctx.currentTime + i * 0.25 + 0.45);
    });
  } catch (e) {}
}
function speak(text) {
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text); u.rate = 0.95;
    setTimeout(() => speechSynthesis.speak(u), 900);
  }
}
function renderWall() {
  const prep = S.orders.filter((o) => o.status === "preparing");
  const ready = S.orders.filter((o) => o.status === "ready");
  const newly = ready.filter((o) => !announced.has(o.id));
  $("wallPreparing").innerHTML = prep.map((o) => `<div class="tk">${o.token}</div>`).join("") || '<span class="muted">—</span>';
  $("wallReady").innerHTML = ready.map((o) => `<div class="tk ${newly.includes(o) && wallInit ? "pop" : ""}">${o.token}</div>`).join("") || '<span class="muted">—</span>';
  if (wallInit && soundOn && newly.length) {
    chime(); newly.forEach((o) => speak(`Token ${o.token.replace("B-", "B ")} is ready at Counter 1`));
  }
  ready.forEach((o) => announced.add(o.id)); wallInit = true;
}

/* ============ KOT CONSOLE ============ */
function renderKOT() {
  const active = S.orders.filter((o) => o.status !== "collected").sort((a, b) => a.createdAt - b.createdAt);
  $("kotList").innerHTML = active.length ? active.map((o) => `
    <div class="kot ${o.status}">
      <h3>#${o.token} ${o.slot !== "now" ? `<span class="badge">⏰ ${o.slot}</span>` : ""}</h3>
      <div class="muted small">ETA ${o.eta} min · ${new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      <ul>${o.items.map((i) => `<li><b>${i.qty}×</b> ${i.name}${i.opts ? ` <span class="muted small">(${i.opts})</span>` : ""}</li>`).join("")}</ul>
      ${o.status === "preparing"
        ? `<button data-ready="${o.id}">✅ Mark Ready</button>`
        : `<button class="collect" data-collect="${o.id}">📦 Collected</button>`}
    </div>`).join("") : '<p class="muted">No active orders 🎉</p>';
  document.querySelectorAll("[data-ready]").forEach((b) => (b.onclick = () => setStatus(+b.dataset.ready, "ready")));
  document.querySelectorAll("[data-collect]").forEach((b) => (b.onclick = () => setStatus(+b.dataset.collect, "collected")));

  $("stockList").innerHTML = MENU.map((m) => `
    <div class="stock"><span>${m.e} ${m.name}</span>
    <button class="switch ${S.soldOut[m.id] ? "off" : ""}" data-stock="${m.id}">${S.soldOut[m.id] ? "Sold Out" : "In Stock"}</button></div>`).join("");
  document.querySelectorAll("[data-stock]").forEach((b) => (b.onclick = () => {
    S = loadState(); S.soldOut[b.dataset.stock] = !S.soldOut[b.dataset.stock]; saveState(); renderAll();
  }));
}
function setStatus(id, status) {
  S = loadState();
  const o = S.orders.find((x) => x.id === id); if (o) o.status = status;
  saveState(); renderAll();
}
$("resetBtn").onclick = () => {
  if (confirm("Clear all orders, tokens and stock settings?")) {
    localStorage.removeItem(KEY); localStorage.removeItem(MY_KEY);
    S = loadState(); announced.clear(); renderAll();
  }
};

/* ============ RENDER + SYNC ============ */
function renderWallet() { $("walletBal").textContent = S.wallet; }
function renderAll() {
  renderWallet(); renderMyToken();
  if (currentView === "order") renderMenu();
  if (currentView === "wall") renderWall();
  if (currentView === "kot") renderKOT();
}
// Live sync between tabs/screens
window.addEventListener("storage", (e) => { if (e.key === KEY) { S = loadState(); renderAll(); } });
let lastSnap = "";
setInterval(() => { // polling fallback
  const raw = localStorage.getItem(KEY) || "";
  if (raw !== lastSnap) { lastSnap = raw; S = loadState(); renderAll(); }
}, 1500);

/* ============ INIT ============ */
renderCategories(); renderCart(); renderAll();