/**
 * L'ÉTOILE & TABLE - CHEFDESK & MAGNIFIC GOURMET
 * Reactive State Management with LocalStorage Sync and Pub/Sub Event Bus
 */

class AppState {
  constructor() {
    this.storageKeys = {
      cart: "chefdesk_cart_v1",
      favorites: "chefdesk_favs_v1",
      theme: "chefdesk_theme_v1",
      auth: "chefdesk_auth_v1",
      orders: "chefdesk_orders_v1",
      promo: "chefdesk_promo_v1",
      tip: "chefdesk_tip_v1"
    };

    this.listeners = new Map();

    // Initialize State
    this.cart = this.loadFromStorage(this.storageKeys.cart, []);
    this.favorites = new Set(this.loadFromStorage(this.storageKeys.favorites, []));
    this.theme = this.loadFromStorage(this.storageKeys.theme, this.getSystemTheme());
    this.auth = this.loadFromStorage(this.storageKeys.auth, {
      isLoggedIn: false,
      user: {
        name: "Gourmet Connoisseur",
        email: "guest@cravio.in",
        phone: "+91 98765 43210",
        address: "Skyline Residency, Tower 4B, Cyber Hub",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
      }
    });
    this.orders = this.loadFromStorage(this.storageKeys.orders, []);
    this.appliedPromo = this.loadFromStorage(this.storageKeys.promo, null);
    this.tipAmount = this.loadFromStorage(this.storageKeys.tip, 30);

    // Active UI Filters
    this.filters = {
      category: "all",
      searchQuery: "",
      dietaryTag: "all",
      dietType: "all", // "all", "veg", or "nonveg"
      maxPrice: 800,
      sortBy: "recommended",
      restaurantId: null
    };

    // Active Tracking Order ID
    this.activeTrackingOrderId = null;
  }

  // --- LocalStorage Helpers ---
  loadFromStorage(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.warn(`Could not read localStorage for key ${key}:`, e);
      return fallback;
    }
  }

  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Could not save to localStorage for key ${key}:`, e);
    }
  }

  getSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "dark"; // Default to dark luxury aesthetic inspired by ChefDesk/Magnific
  }

  // --- Pub/Sub Event System ---
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }

  // --- Theme Actions ---
  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    this.saveToStorage(this.storageKeys.theme, this.theme);
    this.applyThemeToDOM();
    this.emit("theme:change", this.theme);
  }

  applyThemeToDOM() {
    if (this.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }

  // --- Cart Actions ---
  addToCart(item, quantity = 1, customNotes = "") {
    const existingIndex = this.cart.findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
      if (customNotes) this.cart[existingIndex].notes = customNotes;
    } else {
      this.cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        restaurantName: item.restaurantName,
        restaurantId: item.restaurantId,
        quantity: quantity,
        notes: customNotes
      });
    }

    this.saveToStorage(this.storageKeys.cart, this.cart);
    this.emit("cart:updated", this.getCartSummary());
  }

  removeFromCart(itemId) {
    this.cart = this.cart.filter(i => i.id !== itemId);
    this.saveToStorage(this.storageKeys.cart, this.cart);
    this.emit("cart:updated", this.getCartSummary());
  }

  updateQuantity(itemId, delta) {
    const index = this.cart.findIndex(i => i.id === itemId);
    if (index > -1) {
      this.cart[index].quantity += delta;
      if (this.cart[index].quantity <= 0) {
        this.cart.splice(index, 1);
      }
      this.saveToStorage(this.storageKeys.cart, this.cart);
      this.emit("cart:updated", this.getCartSummary());
    }
  }

  clearCart() {
    this.cart = [];
    this.appliedPromo = null;
    this.saveToStorage(this.storageKeys.cart, this.cart);
    this.saveToStorage(this.storageKeys.promo, null);
    this.emit("cart:updated", this.getCartSummary());
  }

  setTip(amount) {
    this.tipAmount = Math.max(0, parseFloat(amount) || 0);
    this.saveToStorage(this.storageKeys.tip, this.tipAmount);
    this.emit("cart:updated", this.getCartSummary());
  }

  applyPromoCode(code) {
    if (!code) return { success: false, message: "Please enter a voucher code." };
    const cleanCode = code.trim().toUpperCase();
    const promo = APP_DATA.promotions.find(p => p.code === cleanCode);

    if (!promo) {
      return { success: false, message: `Promo code "${cleanCode}" is invalid.` };
    }

    const summary = this.getCartSummary();
    if (summary.subtotal < promo.minOrder) {
      return {
        success: false,
        message: `Promo code "${cleanCode}" requires a minimum subtotal of ₹${promo.minOrder}.`
      };
    }

    this.appliedPromo = promo;
    this.saveToStorage(this.storageKeys.promo, this.appliedPromo);
    this.emit("cart:updated", this.getCartSummary());
    return { success: true, message: `Applied! ${promo.title}`, promo };
  }

  removePromoCode() {
    this.appliedPromo = null;
    this.saveToStorage(this.storageKeys.promo, null);
    this.emit("cart:updated", this.getCartSummary());
  }

  getCartItemQuantity(itemId) {
    const item = this.cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }

  getCartSummary() {
    const subtotal = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    // Free delivery threshold: ₹599 or promo
    const standardDeliveryFee = subtotal > 0 ? 49 : 0;
    const isFreeDelivery = (this.appliedPromo && this.appliedPromo.isFreeDelivery) || subtotal >= 599;
    const deliveryFee = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : standardDeliveryFee);

    // Discount Calculation
    let discount = 0;
    if (this.appliedPromo && subtotal >= this.appliedPromo.minOrder) {
      if (this.appliedPromo.discountPercent) {
        discount = (subtotal * this.appliedPromo.discountPercent) / 100;
      } else if (this.appliedPromo.discountFixed) {
        discount = Math.min(subtotal, this.appliedPromo.discountFixed);
      }
    }

    // Taxes (8%)
    const tax = subtotal > 0 ? (subtotal - discount) * 0.08 : 0;
    const tip = subtotal > 0 ? this.tipAmount : 0;
    const total = Math.max(0, subtotal - discount + deliveryFee + tax + tip);

    return {
      items: this.cart,
      itemCount: count,
      subtotal,
      discount,
      deliveryFee,
      isFreeDelivery,
      freeDeliveryRemaining: Math.max(0, 599 - subtotal),
      tax,
      tip,
      total,
      appliedPromo: this.appliedPromo
    };
  }

  // --- Favorites System ---
  toggleFavorite(id) {
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
    } else {
      this.favorites.add(id);
    }
    this.saveToStorage(this.storageKeys.favorites, Array.from(this.favorites));
    this.emit("favorites:change", { id, isFavorite: this.favorites.has(id) });
  }

  isFavorite(id) {
    return this.favorites.has(id);
  }

  // --- Filter Actions ---
  setFilter(key, value) {
    this.filters[key] = value;
    this.emit("filters:change", this.filters);
  }

  resetFilters() {
    this.filters = {
      category: "all",
      searchQuery: "",
      dietaryTag: "all",
      dietType: "all",
      maxPrice: 800,
      sortBy: "recommended",
      restaurantId: null
    };
    this.emit("filters:change", this.filters);
  }

  // --- Auth Actions ---
  login(userData) {
    this.auth = {
      isLoggedIn: true,
      user: {
        name: userData.name || "Gourmet Connoisseur",
        email: userData.email,
        phone: userData.phone || "+1 (555) 382-9014",
        address: userData.address || "742 Evergreen Terrace, Apt 4B, Arts District",
        avatar: userData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
      }
    };
    this.saveToStorage(this.storageKeys.auth, this.auth);
    this.emit("auth:change", this.auth);
  }

  logout() {
    this.auth.isLoggedIn = false;
    this.saveToStorage(this.storageKeys.auth, this.auth);
    this.emit("auth:change", this.auth);
  }

  // --- Order History & Live Tracking ---
  createOrder(checkoutDetails) {
    const summary = this.getCartSummary();
    const orderId = "CD-" + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toISOString();

    const newOrder = {
      id: orderId,
      date: orderDate,
      customer: {
        name: checkoutDetails.name,
        phone: checkoutDetails.phone,
        email: checkoutDetails.email,
        address: checkoutDetails.address,
        notes: checkoutDetails.notes || "Leave at lobby / contact upon arrival"
      },
      payment: {
        method: checkoutDetails.paymentMethod,
        last4: checkoutDetails.cardNumber ? checkoutDetails.cardNumber.slice(-4) : "8821"
      },
      items: [...this.cart],
      pricing: {
        subtotal: summary.subtotal,
        discount: summary.discount,
        deliveryFee: summary.deliveryFee,
        tax: summary.tax,
        tip: summary.tip,
        total: summary.total
      },
      status: "confirmed", // 'confirmed' -> 'kitchen' -> 'on_way' -> 'delivered'
      etaMinutes: 28,
      driver: {
        name: "Marco 'Swift' Rossi",
        vehicle: "Electric Vespa GT",
        phone: "+1 (555) 791-2309",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        rating: 4.98
      }
    };

    this.orders.unshift(newOrder);
    this.saveToStorage(this.storageKeys.orders, this.orders);
    this.activeTrackingOrderId = orderId;
    this.clearCart();
    this.emit("order:created", newOrder);
    return newOrder;
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === id);
  }

  updateOrderStatus(orderId, status) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveToStorage(this.storageKeys.orders, this.orders);
      this.emit("order:statusUpdated", order);
    }
  }
}

// Global App State Instance
window.state = new AppState();
