const API_URL = "https://fakestoreapi.com/products";

const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const sortSelect = document.getElementById("sort");
const message = document.getElementById("message");
const loadMoreBtn = document.getElementById("loadMore");

const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItemsContainer = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

let products = [];
let visibleProducts = 8;

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// 1. Fetch products from API
async function fetchProducts() {
    message.textContent = "Loading products...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        products = await response.json();

        loadCategories();
        displayProducts();
    } catch (error) {
        message.textContent = "Error loading products. Please try again.";
        console.error(error);
    }
}

// 2. Load categories dynamically
function loadCategories() {
    const categories = [...new Set(products.map(p => p.category))];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// 3. Search, filter and sort
function getFilteredProducts() {
    let filtered = products.filter(product => {
        const matchesSearch = product.title
            .toLowerCase()
            .includes(searchInput.value.toLowerCase());

        const matchesCategory =
            categorySelect.value === "all" ||
            product.category === categorySelect.value;

        return matchesSearch && matchesCategory;
    });

    if (sortSelect.value === "low") {
        filtered.sort((a, b) => a.price - b.price);
    }

    if (sortSelect.value === "high") {
        filtered.sort((a, b) => b.price - a.price);
    }

    if (sortSelect.value === "name") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
}

// 4. Display products
function displayProducts() {
    const filtered = getFilteredProducts();

    productsContainer.innerHTML = "";

    const shown = filtered.slice(0, visibleProducts);

    if (shown.length === 0) {
        productsContainer.innerHTML =
            '<p class="empty">No products found!</p>';
    }

    shown.forEach(product => {
        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
            <img src="${product.image}"
                 alt="${product.title}"
                 loading="lazy">

            <p class="category-name">${product.category}</p>

            <h3>${product.title}</h3>

            <p class="price">$${product.price.toFixed(2)}</p>

            <button class="add-btn"
                    data-id="${product.id}">
                Add to Cart
            </button>
        `;

        productsContainer.appendChild(card);
    });

    loadMoreBtn.disabled = visibleProducts >= filtered.length;
    message.textContent = `${filtered.length} products found`;
}

// 5. Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);

    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
}

// 6. Save cart in LocalStorage
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

// 7. Display cart
function displayCart() {
    cartItemsContainer.innerHTML = "";

    const count = cart.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    cartCount.textContent = count;
    cartTotal.textContent = `$${total.toFixed(2)}`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML =
            '<p class="empty">Your cart is empty.</p>';
        return;
    }

    cart.forEach(item => {
        const div = document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}">

            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>${item.quantity} × $${item.price.toFixed(2)}</p>
            </div>

            <button class="remove-btn"
                    data-id="${item.id}">
                Remove
            </button>
        `;

        cartItemsContainer.appendChild(div);
    });
}

// 8. Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

// 9. Event listeners

searchInput.addEventListener("input", () => {
    visibleProducts = 8;
    displayProducts();
});

categorySelect.addEventListener("change", () => {
    visibleProducts = 8;
    displayProducts();
});

sortSelect.addEventListener("change", displayProducts);

// Add to cart button
productsContainer.addEventListener("click", event => {
    const button = event.target.closest(".add-btn");

    if (button) {
        addToCart(Number(button.dataset.id));
    }
});

// Remove button
cartItemsContainer.addEventListener("click", event => {
    const button = event.target.closest(".remove-btn");

    if (button) {
        removeFromCart(Number(button.dataset.id));
    }
});

// Load more products
loadMoreBtn.addEventListener("click", () => {
    visibleProducts += 8;
    displayProducts();
});

// Open cart
document.getElementById("cartBtn").addEventListener("click", () => {
    cartPanel.classList.add("active");
    overlay.classList.add("active");
});

// Close cart
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

function closeCart() {
    cartPanel.classList.remove("active");
    overlay.classList.remove("active");
}

// Clear cart
document.getElementById("clearCart").addEventListener("click", () => {
    cart = [];
    saveCart();
});

// Start website
displayCart();
fetchProducts();