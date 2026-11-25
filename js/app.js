/**
 * L'ÉTOILE & TABLE - CHEFDESK & MAGNIFIC GOURMET
 * Master Application Controller: Event Listeners, Modals, Filter Pipeline, & UI Sync
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Application
  App.init();
});

const App = {
  init() {
    // 1. Initialize Theme from State
    window.state.applyThemeToDOM();

    // 2. Render Initial Views
    this.renderHeroPromos();
    this.renderCategories();
    this.renderRestaurants();
    this.renderFoodMenu();
    this.renderTestimonials();
    this.updateCartBadge();
    this.syncCartDrawer();

    // 3. Attach Global Event Listeners
    this.attachEventListeners();
    this.attachStateSubscriptions();

    console.log("ChefDesk & Magnific Gourmet Platform initialized successfully.");
  },

  // --- Subscriptions to Reactive State ---
  attachStateSubscriptions() {
    window.state.subscribe("cart:updated", summary => {
      this.updateCartBadge();
      this.syncCartDrawer();
      this.syncFoodCardSteppers();
    });

    window.state.subscribe("favorites:change", data => {
      this.syncFavoriteButtons(data.id, data.isFavorite);
      this.renderWishlistDrawer();
    });

    window.state.subscribe("theme:change", theme => {
      const themeBtn = document.getElementById("theme-toggle-btn");
      if (themeBtn) {
        themeBtn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
      }
    });

    window.state.subscribe("filters:change", () => {
      this.renderFoodMenu();
    });

    window.state.subscribe("auth:change", auth => {
      this.syncAuthUI(auth);
    });
  },

  // --- Rendering UI Sections ---

  renderCategories() {
    const container = document.getElementById("categories-container");
    if (!container) return;

    const currentCat = window.state.filters.category;
    container.innerHTML = APP_DATA.categories
      .map(cat => Components.renderCategoryPill(cat, cat.id === currentCat))
      .join("");
  },

  renderRestaurants(filteredList = null) {
    const container = document.getElementById("restaurants-grid");
    if (!container) return;

    const list = filteredList || APP_DATA.restaurants;
    container.innerHTML = list.map(rest => Components.renderRestaurantCard(rest)).join("");
  },

  renderFoodMenu() {
    const container = document.getElementById("food-grid");
    const counterEl = document.getElementById("filtered-results-count");
    const activeRestBanner = document.getElementById("active-restaurant-banner");
    if (!container) return;

    const { category, searchQuery, dietaryTag, maxPrice, sortBy, restaurantId } = window.state.filters;

    // Show or hide Active Restaurant Filter Notice
    if (activeRestBanner) {
      if (restaurantId) {
        const rest = APP_DATA.restaurants.find(r => r.id === restaurantId);
        activeRestBanner.innerHTML = `
          <div class="active-filter-alert">
            <span>Showing signature menu for: <strong>${rest ? rest.name : "Selected Restaurant"}</strong></span>
            <button type="button" class="btn-clear-rest-filter" id="btn-clear-rest-filter">Show All Restaurants &times;</button>
          </div>
        `;
        activeRestBanner.style.display = "block";
      } else {
        activeRestBanner.style.display = "none";
      }
    }

    // Filter pipeline
    let items = APP_DATA.foodItems.filter(item => {
      // 1. Category Filter
      if (category !== "all" && item.category !== category) return false;

      // 2. Restaurant Filter
      if (restaurantId && item.restaurantId !== restaurantId) return false;

      // 3. Search Query Filter (name, desc, restaurant, or ingredients)
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchRest = item.restaurantName.toLowerCase().includes(query);
        const matchIngredients = item.ingredients.some(ing => ing.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchRest && !matchIngredients) return false;
      }

      // 4. Dietary Tag Filter
      if (dietaryTag !== "all") {
        if (!item.dietary.some(d => d.toLowerCase().includes(dietaryTag.toLowerCase()))) {
          return false;
        }
      }

      // 5. Price Filter
      if (item.price > maxPrice) return false;

      return true;
    });

    // Sorting pipeline
    if (sortBy === "rating") {
      items.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "deliveryTime") {
      items.sort((a, b) => parseInt(a.prepTime) - parseInt(b.prepTime));
    } else if (sortBy === "priceAsc") {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === "bestseller") {
      items.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    }

    // Update Counter
    if (counterEl) {
      counterEl.textContent = `${items.length} ${items.length === 1 ? "dish" : "dishes"} available`;
    }

    // Empty State Check
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🍽️</div>
          <h3>No culinary dishes match your criteria</h3>
          <p>Try adjusting your search keywords, price filter, or dietary preferences.</p>
          <button type="button" class="btn btn-primary" id="btn-reset-filters">Reset All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(food => Components.renderFoodCard(food)).join("");
  },

  renderHeroPromos() {
    const container = document.getElementById("promos-container");
    if (!container) return;
    container.innerHTML = APP_DATA.promotions.map(promo => Components.renderPromoCard(promo)).join("");
  },

  renderTestimonials() {
    const container = document.getElementById("testimonials-container");
    if (!container) return;
    container.innerHTML = APP_DATA.testimonials.map(t => Components.renderTestimonial(t)).join("");
  },

  // --- Cart UI Synchronization ---

  updateCartBadge() {
    const summary = window.state.getCartSummary();
    const badges = document.querySelectorAll(".cart-badge-counter");
    badges.forEach(badge => {
      badge.textContent = summary.itemCount;
      badge.style.display = summary.itemCount > 0 ? "flex" : "none";
      badge.classList.add("badge-bounce");
      setTimeout(() => badge.classList.remove("badge-bounce"), 400);
    });
  },

  syncCartDrawer() {
    const summary = window.state.getCartSummary();
    const container = document.getElementById("cart-items-container");
    const subtotalEl = document.getElementById("cart-subtotal");
    const deliveryEl = document.getElementById("cart-delivery-fee");
    const discountEl = document.getElementById("cart-discount-row");
    const discountAmountEl = document.getElementById("cart-discount-amount");
    const taxEl = document.getElementById("cart-tax");
    const totalEl = document.getElementById("cart-total");
    const freeDeliveryNotice = document.getElementById("free-delivery-progress-notice");
    const freeDeliveryBar = document.getElementById("free-delivery-progress-bar");
    const checkoutBtn = document.getElementById("btn-go-to-checkout");

    if (!container) return;

    if (summary.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-art">🛍️</div>
          <h4>Your Cravio Cart is Empty</h4>
          <p>Explore our artisan kitchens and order whatever you're craving today.</p>
          <button type="button" class="btn btn-primary" onclick="App.closeCartDrawer()">Explore Menu</button>
        </div>
      `;
      if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
      container.innerHTML = summary.items.map(item => Components.renderCartItem(item)).join("");
      if (checkoutBtn) checkoutBtn.disabled = false;
    }

    // Update Totals
    if (subtotalEl) subtotalEl.textContent = Utils.formatCurrency(summary.subtotal);
    if (deliveryEl) {
      deliveryEl.textContent = summary.deliveryFee === 0 ? "FREE" : Utils.formatCurrency(summary.deliveryFee);
    }

    if (discountEl && discountAmountEl) {
      if (summary.discount > 0) {
        discountEl.style.display = "flex";
        discountAmountEl.textContent = `-${Utils.formatCurrency(summary.discount)}`;
      } else {
        discountEl.style.display = "none";
      }
    }

    if (taxEl) taxEl.textContent = Utils.formatCurrency(summary.tax);
    if (totalEl) totalEl.textContent = Utils.formatCurrency(summary.total);

    // Free delivery progress meter (₹599 threshold)
    if (freeDeliveryNotice && freeDeliveryBar) {
      if (summary.isFreeDelivery) {
        freeDeliveryNotice.innerHTML = `🎉 <strong>Complimentary Delivery Unlocked!</strong>`;
        freeDeliveryBar.style.width = "100%";
      } else {
        const remaining = summary.freeDeliveryRemaining;
        const percent = Math.min(100, (summary.subtotal / 599) * 100);
        freeDeliveryNotice.innerHTML = `Add <strong>${Utils.formatCurrency(remaining)}</strong> more to get <strong>Free Delivery</strong>!`;
        freeDeliveryBar.style.width = `${percent}%`;
      }
    }

    // Active Promo Tag in Cart
    const appliedPromoBox = document.getElementById("applied-promo-tag");
    if (appliedPromoBox) {
      if (summary.appliedPromo) {
        appliedPromoBox.style.display = "flex";
        appliedPromoBox.innerHTML = `
          <span>Voucher <strong>${summary.appliedPromo.code}</strong> applied!</span>
          <button type="button" class="btn-remove-promo" id="btn-remove-promo">&times;</button>
        `;
      } else {
        appliedPromoBox.style.display = "none";
      }
    }
  },

  syncFoodCardSteppers() {
    const cards = document.querySelectorAll(".food-card");
    cards.forEach(card => {
      const foodId = card.getAttribute("data-food-id");
      const ctaWrap = card.querySelector(".cart-cta-container");
      if (!ctaWrap) return;

      const qty = window.state.getCartItemQuantity(foodId);
      if (qty > 0) {
        ctaWrap.innerHTML = `
          <div class="card-stepper">
            <button type="button" class="btn-stepper btn-minus" data-decrease-id="${foodId}" aria-label="Decrease quantity">&minus;</button>
            <span class="stepper-count">${qty}</span>
            <button type="button" class="btn-stepper btn-plus" data-increase-id="${foodId}" aria-label="Increase quantity">&plus;</button>
          </div>
        `;
      } else {
        ctaWrap.innerHTML = `
          <button type="button" class="btn btn-add-cart" data-add-cart="${foodId}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cart-plus-icon">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Add</span>
          </button>
        `;
      }
    });
  },

  syncFavoriteButtons(id, isFav) {
    const btns = document.querySelectorAll(`[data-fav-id="${id}"]`);
    btns.forEach(btn => {
      if (isFav) {
        btn.classList.add("is-favorite");
        btn.querySelector("svg").setAttribute("fill", "#E63946");
      } else {
        btn.classList.remove("is-favorite");
        btn.querySelector("svg").setAttribute("fill", "none");
      }
    });
  },

  renderWishlistDrawer() {
    const container = document.getElementById("wishlist-items-container");
    if (!container) return;

    const favIds = Array.from(window.state.favorites);
    if (favIds.length === 0) {
      container.innerHTML = `
        <div class="wishlist-empty">
          <div class="empty-icon">🤍</div>
          <h4>Your Wishlist is Empty</h4>
          <p>Tap the heart icon on any restaurant or dish to bookmark it for later.</p>
        </div>
      `;
      return;
    }

    const favDishes = APP_DATA.foodItems.filter(f => favIds.includes(f.id));
    const favRestaurants = APP_DATA.restaurants.filter(r => favIds.includes(r.id));

    let html = "";
    if (favRestaurants.length > 0) {
      html += `<h4 class="wishlist-group-title">Saved Restaurants (${favRestaurants.length})</h4>`;
      html += favRestaurants
        .map(
          r => `
        <div class="wishlist-row">
          <img src="${r.logo}" class="wishlist-thumb" alt="${r.name}" />
          <div class="wishlist-row-info">
            <h5>${r.name}</h5>
            <p>${r.cuisine} • ★ ${r.rating.toFixed(2)}</p>
          </div>
          <button type="button" class="btn btn-outline-sm" onclick="App.filterByRestaurant('${r.id}')">View</button>
        </div>
      `
        )
        .join("");
    }

    if (favDishes.length > 0) {
      html += `<h4 class="wishlist-group-title" style="margin-top: 20px;">Saved Dishes (${favDishes.length})</h4>`;
      html += favDishes
        .map(
          f => `
        <div class="wishlist-row">
          <img src="${f.image}" class="wishlist-thumb" alt="${f.name}" />
          <div class="wishlist-row-info">
            <h5>${f.name}</h5>
            <p>${Utils.formatCurrency(f.price)} • ${f.restaurantName}</p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="App.quickAddToCart('${f.id}')">Add +</button>
        </div>
      `
        )
        .join("");
    }

    container.innerHTML = html;
  },

  syncAuthUI(auth) {
    const userNameEl = document.getElementById("nav-user-name");
    const userAvatarEl = document.getElementById("nav-user-avatar");
    if (userNameEl) {
      userNameEl.textContent = auth.isLoggedIn ? auth.user.name.split(" ")[0] : "Sign In";
    }
    if (userAvatarEl && auth.user?.avatar) {
      userAvatarEl.src = auth.user.avatar;
    }
  },

  // --- Modal Openers & Controllers ---

  openCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    if (drawer && backdrop) {
      drawer.classList.add("open");
      backdrop.classList.add("visible");
      document.body.style.overflow = "hidden";
    }
  },

  closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    if (drawer && backdrop) {
      drawer.classList.remove("open");
      backdrop.classList.remove("visible");
      document.body.style.overflow = "";
    }
  },

  openWishlistDrawer() {
    this.renderWishlistDrawer();
    const drawer = document.getElementById("wishlist-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    if (drawer && backdrop) {
      drawer.classList.add("open");
      backdrop.classList.add("visible");
      document.body.style.overflow = "hidden";
    }
  },

  closeWishlistDrawer() {
    const drawer = document.getElementById("wishlist-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    if (drawer && backdrop) {
      drawer.classList.remove("open");
      backdrop.classList.remove("visible");
      document.body.style.overflow = "";
    }
  },

  openFoodModal(foodId) {
    const food = APP_DATA.foodItems.find(f => f.id === foodId);
    if (!food) return;

    const modal = document.getElementById("food-details-modal");
    const body = document.getElementById("food-modal-body");
    if (!modal || !body) return;

    const cartQty = window.state.getCartItemQuantity(food.id);

    body.innerHTML = `
      <div class="food-modal-grid">
        <div class="food-modal-media">
          <img src="${food.image}" alt="${food.name}" class="food-modal-img" />
          <div class="food-modal-badges">
            <span class="badge badge-accent">${food.calories}</span>
            <span class="badge badge-primary">★ ${food.rating.toFixed(2)} (${food.reviews} reviews)</span>
          </div>
        </div>

        <div class="food-modal-content">
          <p class="modal-restaurant-name">${food.restaurantName}</p>
          <h2 class="modal-food-title">${food.name}</h2>
          <div class="modal-price-tag">${Utils.formatCurrency(food.price)}</div>
          
          <p class="modal-description">${food.description}</p>

          <div class="modal-ingredients-section">
            <h4>Chef's Selected Ingredients</h4>
            <div class="ingredients-chips">
              ${food.ingredients.map(ing => `<span class="ing-chip">${ing}</span>`).join("")}
            </div>
          </div>

          <div class="modal-dietary-section">
            <h4>Dietary Profile</h4>
            <div class="dietary-tags-row">
              ${food.dietary.map(d => `<span class="dietary-badge tag-gold">${d}</span>`).join("")}
            </div>
          </div>

          <div class="modal-notes-field">
            <label for="food-custom-note">Kitchen Preparation Notes (optional):</label>
            <input type="text" id="food-custom-note" placeholder="E.g., Dressing on the side, extra crispy, no cutlery" />
          </div>

          <div class="modal-actions-row">
            <div class="modal-stepper">
              <button type="button" class="btn-stepper-lg" id="modal-qty-minus">&minus;</button>
              <span class="modal-qty-count" id="modal-qty-display">1</span>
              <button type="button" class="btn-stepper-lg" id="modal-qty-plus">&plus;</button>
            </div>
            <button type="button" class="btn btn-primary btn-add-modal" id="modal-submit-add">
              Add to Gourmet Order • <span id="modal-total-calc">${Utils.formatCurrency(food.price)}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Modal Qty Logic
    let qty = 1;
    const qtyDisplay = document.getElementById("modal-qty-display");
    const totalCalc = document.getElementById("modal-total-calc");
    const minusBtn = document.getElementById("modal-qty-minus");
    const plusBtn = document.getElementById("modal-qty-plus");
    const addBtn = document.getElementById("modal-submit-add");

    const updateCalc = () => {
      qtyDisplay.textContent = qty;
      totalCalc.textContent = Utils.formatCurrency(food.price * qty);
    };

    minusBtn.addEventListener("click", () => {
      if (qty > 1) {
        qty--;
        updateCalc();
      }
    });

    plusBtn.addEventListener("click", () => {
      qty++;
      updateCalc();
    });

    addBtn.addEventListener("click", () => {
      const notes = document.getElementById("food-custom-note").value.trim();
      window.state.addToCart(food, qty, notes);
      Utils.playChime("add");
      Utils.showToast("Added to Gourmet Cart", `${qty}x ${food.name}`, "success");
      modal.close();
    });

    modal.showModal();
  },

  openCheckoutModal() {
    const summary = window.state.getCartSummary();
    if (summary.items.length === 0) {
      Utils.showToast("Empty Cart", "Please add items to your cart before proceeding.", "info");
      return;
    }

    this.closeCartDrawer();
    const modal = document.getElementById("checkout-modal");
    if (!modal) return;

    // Prefill form from auth if available
    const authUser = window.state.auth.user;
    const nameInput = document.getElementById("checkout-name");
    const emailInput = document.getElementById("checkout-email");
    const phoneInput = document.getElementById("checkout-phone");
    const addressInput = document.getElementById("checkout-address");

    if (nameInput) nameInput.value = authUser.name || "";
    if (emailInput) emailInput.value = authUser.email || "";
    if (phoneInput) phoneInput.value = authUser.phone || "";
    if (addressInput) addressInput.value = authUser.address || "";

    // Sync Checkout Summary Sidebar
    this.syncCheckoutSummary();

    modal.showModal();
  },

  syncCheckoutSummary() {
    const summary = window.state.getCartSummary();
    const container = document.getElementById("checkout-summary-items");
    const totalEl = document.getElementById("checkout-summary-total");

    if (container) {
      container.innerHTML = summary.items
        .map(
          item => `
        <div class="checkout-review-item">
          <span>${item.quantity}x ${item.name}</span>
          <span>${Utils.formatCurrency(item.price * item.quantity)}</span>
        </div>
      `
        )
        .join("");
    }

    if (totalEl) {
      totalEl.textContent = Utils.formatCurrency(summary.total);
    }
  },

  openAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.showModal();
  },

  openProfileModal() {
    const modal = document.getElementById("profile-modal");
    if (!modal) return;

    const user = window.state.auth.user;
    const profileContainer = document.getElementById("profile-modal-body");

    if (profileContainer) {
      profileContainer.innerHTML = `
        <div class="profile-header">
          <img src="${user.avatar}" alt="${user.name}" class="profile-large-avatar" />
          <div class="profile-details">
            <h3>${user.name}</h3>
            <p>${user.email}</p>
            <span class="badge badge-accent">Cravio VIP Member</span>
          </div>
        </div>

        <div class="profile-section">
          <h4>Default Delivery Address</h4>
          <p class="profile-address-text">${user.address}</p>
          <p class="profile-phone-text">Phone: ${user.phone}</p>
        </div>

        <div class="profile-section">
          <h4>Past Gourmet Orders (${window.state.orders.length})</h4>
          <div class="profile-orders-list">
            ${
              window.state.orders.length === 0
                ? `<p class="text-muted">No orders placed yet.</p>`
                : window.state.orders
                    .map(
                      order => `
                  <div class="profile-order-card">
                    <div class="order-card-head">
                      <strong>Order #${order.id}</strong>
                      <span class="status-pill status-${order.status}">${order.status.toUpperCase()}</span>
                    </div>
                    <p class="order-date">${Utils.formatDate(order.date)}</p>
                    <p class="order-items-snippet">${order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</p>
                    <div class="order-card-foot">
                      <span>Total: ${Utils.formatCurrency(order.pricing.total)}</span>
                      <button type="button" class="btn btn-outline-sm" onclick="App.trackOrder('${order.id}')">Track</button>
                    </div>
                  </div>
                `
                    )
                    .join("")
            }
          </div>
        </div>

        <div class="profile-actions">
          <button type="button" class="btn btn-secondary" onclick="window.state.logout(); Utils.showToast('Logged Out', 'You have been signed out.', 'info'); document.getElementById('profile-modal').close();">Sign Out</button>
        </div>
      `;
    }

    modal.showModal();
  },

  trackOrder(orderId) {
    const order = window.state.getOrderById(orderId) || window.state.orders[0];
    if (!order) {
      Utils.showToast("Order Not Found", "Could not locate this order.", "error");
      return;
    }

    // Close any other open modals
    const openModals = document.querySelectorAll("dialog[open]");
    openModals.forEach(m => m.close());

    const modal = document.getElementById("order-tracking-modal");
    const body = document.getElementById("order-tracking-body");
    if (!modal || !body) return;

    body.innerHTML = window.DeliveryTracker.renderTracker(order);
    modal.showModal();

    // Start animated GPS path simulation
    window.DeliveryTracker.startMapSimulation(order);

    // Attach Continue Browsing button inside tracker
    const backBtn = document.getElementById("btn-back-to-browse");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.DeliveryTracker.stopMapSimulation();
        modal.close();
      });
    }
  },

  // --- Quick Actions Helpers ---

  quickAddToCart(foodId) {
    const food = APP_DATA.foodItems.find(f => f.id === foodId);
    if (food) {
      window.state.addToCart(food, 1);
      Utils.playChime("add");
      Utils.showToast("Added to Cart", `${food.name}`, "success");
    }
  },

  filterByRestaurant(restaurantId) {
    this.closeWishlistDrawer();
    window.state.setFilter("restaurantId", restaurantId);
    const targetSection = document.getElementById("menu-section");
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  },

  applyPromoCode(code) {
    if (!code) return;
    const res = window.state.applyPromoCode(code);
    if (res.success) {
      Utils.playChime("success");
      Utils.showToast("Promo Applied!", res.message, "success");
      Utils.celebrate();
      if (window.state.getCartTotalItems() > 0) {
        this.openCartDrawer();
      }
    } else {
      Utils.playChime("error");
      Utils.showToast("Promo Code", res.message, "info");
    }
  },

  // --- Event Listeners Binder ---

  attachEventListeners() {
    // 1. Theme Toggle
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        window.state.toggleTheme();
      });
    }

    // 2. Open / Close Cart Drawer
    const cartTriggerBtns = document.querySelectorAll(".btn-open-cart");
    cartTriggerBtns.forEach(btn => {
      btn.addEventListener("click", () => this.openCartDrawer());
    });

    const closeCartBtn = document.getElementById("btn-close-cart");
    if (closeCartBtn) {
      closeCartBtn.addEventListener("click", () => this.closeCartDrawer());
    }

    // 3. Open / Close Wishlist Drawer
    const wishlistTriggerBtns = document.querySelectorAll(".btn-open-wishlist");
    wishlistTriggerBtns.forEach(btn => {
      btn.addEventListener("click", () => this.openWishlistDrawer());
    });

    const closeWishlistBtn = document.getElementById("btn-close-wishlist");
    if (closeWishlistBtn) {
      closeWishlistBtn.addEventListener("click", () => this.closeWishlistDrawer());
    }

    // 4. Backdrop Click (closes drawers)
    const backdrop = document.getElementById("drawer-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        this.closeCartDrawer();
        this.closeWishlistDrawer();
      });
    }

    // 5. Category Pills Click (Delegation)
    const catContainer = document.getElementById("categories-container");
    if (catContainer) {
      catContainer.addEventListener("click", e => {
        const pill = e.target.closest(".category-pill");
        if (!pill) return;
        const catId = pill.getAttribute("data-category-id");
        window.state.setFilter("category", catId);

        // Update active UI classes
        catContainer.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
      });
    }

    // 6. Real-time Search Input
    const searchInputs = document.querySelectorAll(".search-food-input");
    searchInputs.forEach(input => {
      input.addEventListener("input", e => {
        const val = e.target.value;
        window.state.setFilter("searchQuery", val);
      });
    });

    // 7. Dietary Filter Chips
    const dietarySelect = document.getElementById("dietary-filter");
    if (dietarySelect) {
      dietarySelect.addEventListener("change", e => {
        window.state.setFilter("dietaryTag", e.target.value);
      });
    }

    // 8. Price Range Filter
    const priceSlider = document.getElementById("price-slider");
    const priceDisplay = document.getElementById("price-display");
    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener("input", e => {
        const val = parseFloat(e.target.value);
        priceDisplay.textContent = `₹${val.toFixed(0)}`;
        window.state.setFilter("maxPrice", val);
      });
    }

    // 9. Sort Dropdown
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", e => {
        window.state.setFilter("sortBy", e.target.value);
      });
    }

    // 10. Global Card Click Delegations (Add to Cart, Steppers, Favorites, Details Modal)
    document.addEventListener("click", e => {
      // Favorite Heart Toggle
      const favBtn = e.target.closest(".btn-fav");
      if (favBtn) {
        e.stopPropagation();
        const id = favBtn.getAttribute("data-fav-id");
        window.state.toggleFavorite(id);
        const isNowFav = window.state.isFavorite(id);
        Utils.showToast(isNowFav ? "Saved to Favorites" : "Removed from Favorites", "", "info");
        return;
      }

      // Add to Cart from Card Button
      const addCartBtn = e.target.closest("[data-add-cart]");
      if (addCartBtn) {
        e.stopPropagation();
        const foodId = addCartBtn.getAttribute("data-add-cart");
        this.quickAddToCart(foodId);
        return;
      }

      // Card Stepper Plus
      const plusBtn = e.target.closest("[data-increase-id]");
      if (plusBtn) {
        e.stopPropagation();
        const foodId = plusBtn.getAttribute("data-increase-id");
        window.state.updateQuantity(foodId, 1);
        Utils.playChime("add");
        return;
      }

      // Card Stepper Minus
      const minusBtn = e.target.closest("[data-decrease-id]");
      if (minusBtn) {
        e.stopPropagation();
        const foodId = minusBtn.getAttribute("data-decrease-id");
        window.state.updateQuantity(foodId, -1);
        Utils.playChime("remove");
        return;
      }

      // Open Food Modal on click of media or title
      const openModalTrigger = e.target.closest("[data-open-modal]");
      if (openModalTrigger) {
        const foodId = openModalTrigger.getAttribute("data-open-modal");
        this.openFoodModal(foodId);
        return;
      }

      // Explore Restaurant Menu Button
      const exploreRestBtn = e.target.closest(".view-restaurant-menu-btn");
      if (exploreRestBtn) {
        const restId = exploreRestBtn.getAttribute("data-restaurant-id");
        this.filterByRestaurant(restId);
        return;
      }

      // Restaurant Link on Food Card
      const restLink = e.target.closest("[data-filter-restaurant]");
      if (restLink) {
        const restId = restLink.getAttribute("data-filter-restaurant");
        this.filterByRestaurant(restId);
        return;
      }

      // Clear Active Restaurant Filter
      if (e.target.closest("#btn-clear-rest-filter")) {
        window.state.setFilter("restaurantId", null);
        return;
      }

      // Reset All Filters Button
      if (e.target.closest("#btn-reset-filters")) {
        window.state.resetFilters();
        this.renderCategories();
        if (priceSlider) priceSlider.value = 750;
        if (priceDisplay) priceDisplay.textContent = "₹750";
        if (sortSelect) sortSelect.value = "recommended";
        if (dietarySelect) dietarySelect.value = "all";
        searchInputs.forEach(i => (i.value = ""));
        return;
      }

      // Copy & Apply Promo Code Button
      const copyPromoBtn = e.target.closest("[data-copy-code]");
      if (copyPromoBtn) {
        const code = copyPromoBtn.getAttribute("data-copy-code");
        const res = window.state.applyPromoCode(code);
        if (res.success) {
          Utils.playChime("success");
          Utils.showToast("Voucher Applied!", res.message, "success");
          this.openCartDrawer();
        } else {
          Utils.showToast("Promo Code", res.message, "info");
        }
        return;
      }

      // Cart Item Stepper Mini Plus
      const cartIncBtn = e.target.closest("[data-cart-inc]");
      if (cartIncBtn) {
        const id = cartIncBtn.getAttribute("data-cart-inc");
        window.state.updateQuantity(id, 1);
        Utils.playChime("add");
        return;
      }

      // Cart Item Stepper Mini Minus
      const cartDecBtn = e.target.closest("[data-cart-dec]");
      if (cartDecBtn) {
        const id = cartDecBtn.getAttribute("data-cart-dec");
        window.state.updateQuantity(id, -1);
        Utils.playChime("remove");
        return;
      }

      // Cart Item Remove Trash
      const cartRemoveBtn = e.target.closest("[data-cart-remove]");
      if (cartRemoveBtn) {
        const id = cartRemoveBtn.getAttribute("data-cart-remove");
        window.state.removeFromCart(id);
        Utils.playChime("remove");
        Utils.showToast("Item Removed", "", "info");
        return;
      }

      // Clear Entire Cart
      if (e.target.closest("#btn-clear-cart")) {
        if (confirm("Are you sure you want to clear your gourmet cart?")) {
          window.state.clearCart();
          Utils.showToast("Cart Cleared", "", "info");
        }
        return;
      }

      // Remove Applied Promo in Cart
      if (e.target.closest("#btn-remove-promo")) {
        window.state.removePromoCode();
        Utils.showToast("Voucher Removed", "", "info");
        return;
      }

      // Tip Selectors in Cart
      const tipBtn = e.target.closest(".tip-pill");
      if (tipBtn) {
        document.querySelectorAll(".tip-pill").forEach(p => p.classList.remove("active"));
        tipBtn.classList.add("active");
        const amt = tipBtn.getAttribute("data-tip");
        window.state.setTip(amt);
        return;
      }

      // User Profile Nav Icon Click
      if (e.target.closest("#btn-user-profile")) {
        if (window.state.auth.isLoggedIn) {
          this.openProfileModal();
        } else {
          this.openAuthModal();
        }
        return;
      }
    });

    // 11. Cart Manual Promo Code Apply Form
    const promoForm = document.getElementById("cart-promo-form");
    if (promoForm) {
      promoForm.addEventListener("submit", e => {
        e.preventDefault();
        const input = document.getElementById("cart-promo-input");
        const code = input ? input.value : "";
        const res = window.state.applyPromoCode(code);
        if (res.success) {
          Utils.playChime("success");
          Utils.showToast("Voucher Applied!", res.message, "success");
          if (input) input.value = "";
        } else {
          Utils.showToast("Voucher Error", res.message, "error");
        }
      });
    }

    // 12. Proceed to Checkout Button
    const checkoutTrigger = document.getElementById("btn-go-to-checkout");
    if (checkoutTrigger) {
      checkoutTrigger.addEventListener("click", () => this.openCheckoutModal());
    }

    // 13. Checkout Form Submission
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", e => {
        e.preventDefault();

        const name = document.getElementById("checkout-name").value.trim();
        const email = document.getElementById("checkout-email").value.trim();
        const phone = document.getElementById("checkout-phone").value.trim();
        const address = document.getElementById("checkout-address").value.trim();
        const notes = document.getElementById("checkout-notes").value.trim();
        const paymentMethodEl = document.querySelector('input[name="payment_method"]:checked');
        const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "card";

        // Form Validations
        if (!name) {
          Utils.showToast("Validation Error", "Please provide your full name.", "error");
          return;
        }
        if (!Utils.validateEmail(email)) {
          Utils.showToast("Validation Error", "Please provide a valid email address.", "error");
          return;
        }
        if (!Utils.validatePhone(phone)) {
          Utils.showToast("Validation Error", "Please provide a valid contact phone number.", "error");
          return;
        }
        if (!address) {
          Utils.showToast("Validation Error", "Please provide a complete delivery address.", "error");
          return;
        }

        // Show Processing State
        const submitBtn = document.getElementById("btn-submit-order");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <span class="spinner-small"></span> Authorizing & Dispatching...
          `;
        }

        setTimeout(() => {
          // Create Order in State
          const newOrder = window.state.createOrder({
            name,
            email,
            phone,
            address,
            notes,
            paymentMethod,
            cardNumber: "4242"
          });

          // Celebration Effects
          Utils.playChime("success");
          Utils.launchConfetti();

          // Reset Button
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Place Order & Pay";
          }

          // Close Checkout Modal & Open Tracker
          const checkoutModal = document.getElementById("checkout-modal");
          if (checkoutModal) checkoutModal.close();

          Utils.showToast("Order Placed Successfully!", `Order #${newOrder.id} confirmed.`, "success");
          this.trackOrder(newOrder.id);
        }, 1200);
      });
    }

    // 14. Auth Form Submission (Mock Sign In / Sign Up)
    const authForm = document.getElementById("auth-form");
    if (authForm) {
      authForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("auth-name").value.trim();
        const email = document.getElementById("auth-email").value.trim();

        if (!Utils.validateEmail(email)) {
          Utils.showToast("Validation Error", "Please enter a valid email.", "error");
          return;
        }

        window.state.login({
          name: name || "Gourmet Connoisseur",
          email: email
        });

        Utils.playChime("success");
        Utils.showToast("Welcome to Cravio!", `Signed in as ${name || email}`, "success");
        const modal = document.getElementById("auth-modal");
        if (modal) modal.close();
      });
    }

    // 15. Modal Close Buttons (with .btn-close-modal class)
    document.querySelectorAll(".btn-close-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        const dialog = btn.closest("dialog");
        if (dialog) {
          if (dialog.id === "order-tracking-modal") {
            window.DeliveryTracker.stopMapSimulation();
          }
          dialog.close();
        }
      });
    });

    // 16. Close dialog on backdrop click
    document.querySelectorAll("dialog").forEach(dialog => {
      dialog.addEventListener("click", e => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;

        if (!isInDialog) {
          if (dialog.id === "order-tracking-modal") {
            window.DeliveryTracker.stopMapSimulation();
          }
          dialog.close();
        }
      });
    });
  }
};

window.App = App;
