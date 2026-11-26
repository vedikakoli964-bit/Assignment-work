const API_URL = "https://fakestoreapi.com/products";
const CART_KEY = "shopeasy-cart";

let products = [];
let cart = loadCart(); // [{ id, qty }]

const $ = (id) => document.getElementById(id);
const productsEl = $("products");
const statusEl = $("status");
const searchEl = $("search");
const categoryEl = $("category");
const sortEl = $("sort");
const countEl = $("result-count");

const money = (n) => `$${n.toFixed(2)}`;

/* ---------- Fetch products ---------- */
async function fetchProducts() {
  statusEl.textContent = "Loading products...";
  statusEl.className = "status";
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    products = await res.json();
    statusEl.hidden = true;
    fillCategories();
    render();
    renderCart();
  } catch (err) {
    statusEl.hidden = false;
    statusEl.className = "status error";
    statusEl.textContent = `Could not load products: ${err.message}. Check your connection and reload.`;
  }
}

function fillCategories() {
  const cats = [...new Set(products.map((p) => p.category))];
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryEl.appendChild(opt);
  });
}

/* ---------- Filter, search, sort, render ---------- */
function getVisible() {
  const q = searchEl.value.trim().toLowerCase();
  const cat = categoryEl.value;
  let list = products.filter(
    (p) => (cat === "all" || p.category === cat) && p.title.toLowerCase().includes(q)
  );
  if (sortEl.value === "low") list.sort((a, b) => a.price - b.price);
  if (sortEl.value === "high") list.sort((a, b) => b.price - a.price);
  if (sortEl.value === "rating") list.sort((a, b) => b.rating.rate - a.rating.rate);
  return list;
}

function render() {
  const list = getVisible();
  countEl.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
  productsEl.innerHTML = list
    .map(
      (p) => `
      <article class="card">
        <img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy" />
        <span class="cat">${p.category}</span>
        <h3 title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</h3>
        <div class="rating">${p.rating.rate} / 5 (${p.rating.count} reviews)</div>
        <div class="row">
          <span class="price">${money(p.price)}</span>
          <button data-add="${p.id}">Add to cart</button>
        </div>
      </article>`
    )
    .join("");
  if (!list.length) {
    productsEl.innerHTML = `<p class="status">No products match your search. Try a different word or category.</p>`;
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Cart ---------- */
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  updateCart();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  updateCart();
}

function updateCart() {
  saveCart();
  renderCart();
}

function renderCart() {
  const itemsEl = $("cart-items");
  let total = 0;
  let count = 0;
  const rows = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.id);
      if (!p) return "";
      total += p.price * c.qty;
      count += c.qty;
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="" />
          <div>
            <h4>${escapeHtml(p.title)}</h4>
            <div>${money(p.price)} x ${c.qty} = <strong>${money(p.price * c.qty)}</strong></div>
            <div class="qty">
              <button class="secondary" data-dec="${p.id}" aria-label="Decrease quantity">-</button>
              <span>${c.qty}</span>
              <button class="secondary" data-inc="${p.id}" aria-label="Increase quantity">+</button>
              <button class="remove" data-remove="${p.id}">Remove</button>
            </div>
          </div>
        </div>`;
    })
    .join("");
  itemsEl.innerHTML = rows || `<p class="empty">Your cart is empty. Add a product to get started.</p>`;
  $("cart-total").textContent = money(total);
  $("cart-count").textContent = count;
}

function openCart(open) {
  $("cart").hidden = !open;
  $("overlay").hidden = !open;
}

/* ---------- Events ---------- */
searchEl.addEventListener("input", render);
categoryEl.addEventListener("change", render);
sortEl.addEventListener("change", render);

productsEl.addEventListener("click", (e) => {
  const id = e.target.dataset.add;
  if (id) addToCart(Number(id));
});

$("cart-items").addEventListener("click", (e) => {
  const { inc, dec, remove } = e.target.dataset;
  if (inc) changeQty(Number(inc), 1);
  if (dec) changeQty(Number(dec), -1);
  if (remove) removeFromCart(Number(remove));
});

$("cart-toggle").addEventListener("click", () => openCart(true));
$("cart-close").addEventListener("click", () => openCart(false));
$("overlay").addEventListener("click", () => openCart(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && openCart(false));

$("clear-cart").addEventListener("click", () => {
  cart = [];
  updateCart();
});

$("checkout").addEventListener("click", () => {
  if (!cart.length) return alert("Your cart is empty.");
  alert("Thank you for your order!");
  cart = [];
  updateCart();
  openCart(false);
});

fetchProducts();