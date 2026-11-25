/**
 * L'ÉTOILE & TABLE - CHEFDESK & MAGNIFIC GOURMET
 * Dynamic HTML Component Renderers
 */

const Components = {
  // Category Pill Filter Button
  renderCategoryPill(category, isActive = false) {
    return `
      <button 
        type="button" 
        class="category-pill ${isActive ? "active" : ""}" 
        data-category-id="${category.id}"
        aria-pressed="${isActive}"
      >
        <span class="category-icon">${category.icon}</span>
        <span class="category-name">${category.name}</span>
        <span class="category-count">${category.count}</span>
      </button>
    `;
  },

  // Luxury Restaurant Card
  renderRestaurantCard(restaurant) {
    const isFav = window.state.isFavorite(restaurant.id);
    return `
      <article class="restaurant-card" data-restaurant-id="${restaurant.id}">
        <div class="restaurant-media">
          <img 
            src="${restaurant.image}" 
            alt="${restaurant.name}" 
            loading="lazy" 
            class="restaurant-image"
            onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'"
          />
          <div class="restaurant-gradient-overlay"></div>
          
          <!-- Top Floating Badges -->
          <div class="restaurant-top-badges">
            <span class="badge badge-accent">${restaurant.badge}</span>
            <button 
              type="button" 
              class="btn-fav ${isFav ? "is-favorite" : ""}" 
              data-fav-id="${restaurant.id}"
              data-fav-type="restaurant"
              aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}"
            >
              <svg viewBox="0 0 24 24" fill="${isFav ? "#E63946" : "none"}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <!-- Bottom Meta Tag -->
          <div class="restaurant-time-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-clock">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>${restaurant.deliveryTime}</span>
            <span class="dot-separator">•</span>
            <span>${restaurant.priceTier}</span>
          </div>
        </div>

        <div class="restaurant-body">
          <div class="restaurant-header">
            <img src="${restaurant.logo}" alt="${restaurant.name} logo" class="restaurant-logo-thumb" />
            <div class="restaurant-header-text">
              <h3 class="restaurant-title">${restaurant.name}</h3>
              <p class="restaurant-chef">${restaurant.chef}</p>
            </div>
            <div class="restaurant-rating-chip">
              <svg viewBox="0 0 24 24" fill="currentColor" class="star-icon">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${restaurant.rating.toFixed(2)}</span>
            </div>
          </div>

          <p class="restaurant-cuisine">${restaurant.cuisine}</p>
          <p class="restaurant-desc">${restaurant.description}</p>

          <div class="restaurant-tags">
            ${restaurant.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join("")}
          </div>

          <div class="restaurant-footer">
            <span class="delivery-status ${restaurant.deliveryFee === 0 ? "free" : ""}">
              ${restaurant.deliveryFee === 0 ? "Free Delivery" : `Delivery: ${Utils.formatCurrency(restaurant.deliveryFee)}`}
            </span>
            <button 
              type="button" 
              class="btn btn-outline-sm view-restaurant-menu-btn" 
              data-restaurant-id="${restaurant.id}"
            >
              Explore Menu &rarr;
            </button>
          </div>
        </div>
      </article>
    `;
  },

  // Food Item Card (with dynamic Add / Stepper State)
  renderFoodCard(food) {
    const isFav = window.state.isFavorite(food.id);
    const cartQty = window.state.getCartItemQuantity(food.id);

    // Dietary labels with badges
    const dietaryBadges = food.dietary.map(tag => {
      let cssClass = "tag-default";
      if (tag.includes("Vegetarian") || tag.includes("Vegan")) cssClass = "tag-green";
      if (tag.includes("Spicy")) cssClass = "tag-red";
      if (tag.includes("Chef") || tag.includes("Special")) cssClass = "tag-gold";
      if (tag.includes("Bestseller")) cssClass = "tag-bestseller";
      return `<span class="dietary-badge ${cssClass}">${tag}</span>`;
    }).join("");

    return `
      <article class="food-card" data-food-id="${food.id}" data-category="${food.category}">
        <div class="food-media" data-open-modal="${food.id}">
          <img 
            src="${food.image}" 
            alt="${food.name}" 
            loading="lazy" 
            class="food-image"
            onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'"
          />
          <div class="food-gradient-overlay"></div>

          <!-- Top Overlay: Bestseller / Prep time -->
          <div class="food-top-overlay">
            <span class="food-meta-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${food.prepTime}
            </span>
            <button 
              type="button" 
              class="btn-fav ${isFav ? "is-favorite" : ""}" 
              data-fav-id="${food.id}"
              data-fav-type="food"
              aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}"
            >
              <svg viewBox="0 0 24 24" fill="${isFav ? "#E63946" : "none"}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <!-- Quick view pill -->
          <div class="quick-view-hint">
            <span>Quick Details</span>
          </div>
        </div>

        <div class="food-body">
          <div class="food-dietary-row">
            ${dietaryBadges}
          </div>

          <p class="food-restaurant-link" data-filter-restaurant="${food.restaurantId}">
            ${food.restaurantName}
          </p>

          <h3 class="food-title" data-open-modal="${food.id}">${food.name}</h3>
          
          <p class="food-desc">${food.description}</p>

          <div class="food-specs-row">
            <span class="food-calories">${food.calories}</span>
            <span class="dot-separator">•</span>
            <div class="food-rating">
              <svg viewBox="0 0 24 24" fill="currentColor" class="star-icon-sm">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${food.rating.toFixed(2)} (${food.reviews})</span>
            </div>
          </div>

          <div class="food-action-row">
            <div class="food-price-wrap">
              <span class="food-price">${Utils.formatCurrency(food.price)}</span>
            </div>

            <!-- Dynamic Cart CTA: Add Button or Stepper -->
            <div class="cart-cta-container" data-item-id="${food.id}">
              ${
                cartQty > 0
                  ? `
                <div class="card-stepper">
                  <button type="button" class="btn-stepper btn-minus" data-decrease-id="${food.id}" aria-label="Decrease quantity">&minus;</button>
                  <span class="stepper-count">${cartQty}</span>
                  <button type="button" class="btn-stepper btn-plus" data-increase-id="${food.id}" aria-label="Increase quantity">&plus;</button>
                </div>
              `
                  : `
                <button type="button" class="btn btn-add-cart" data-add-cart="${food.id}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cart-plus-icon">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <span>Add</span>
                </button>
              `
              }
            </div>
          </div>
        </div>
      </article>
    `;
  },

  // Promo Voucher Card
  renderPromoCard(promo) {
    return `
      <div class="promo-card">
        <div class="promo-badge">${promo.badge}</div>
        <div class="promo-content">
          <h4 class="promo-title">${promo.title}</h4>
          <p class="promo-desc">${promo.description}</p>
        </div>
        <div class="promo-action">
          <div class="promo-code-box">
            <span class="promo-code">${promo.code}</span>
            <button 
              type="button" 
              class="btn-copy-code" 
              data-copy-code="${promo.code}"
              title="Copy and apply voucher"
            >
              Apply &copy;
            </button>
          </div>
          <span class="promo-expiry">${promo.expiresIn}</span>
        </div>
      </div>
    `;
  },

  // Cart Drawer Item Row
  renderCartItem(item) {
    const itemTotal = item.price * item.quantity;
    return `
      <div class="cart-item" data-cart-id="${item.id}">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="cart-item-thumb" 
          onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80'"
        />
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <p class="cart-item-restaurant">${item.restaurantName || "Chef Partner"}</p>
          <div class="cart-item-price-unit">${Utils.formatCurrency(item.price)} each</div>
          
          <div class="cart-item-controls">
            <div class="stepper-mini">
              <button type="button" class="btn-stepper-mini" data-cart-dec="${item.id}" aria-label="Decrease">&minus;</button>
              <span class="stepper-mini-count">${item.quantity}</span>
              <button type="button" class="btn-stepper-mini" data-cart-inc="${item.id}" aria-label="Increase">&plus;</button>
            </div>
            <span class="cart-item-total">${Utils.formatCurrency(itemTotal)}</span>
          </div>
        </div>

        <button type="button" class="btn-remove-item" data-cart-remove="${item.id}" aria-label="Remove item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
  },

  // Testimonial Card
  renderTestimonial(t) {
    return `
      <div class="testimonial-card">
        <div class="testimonial-stars">
          ★★★★★
        </div>
        <p class="testimonial-quote">"${t.text}"</p>
        <div class="testimonial-author">
          <img src="${t.avatar}" alt="${t.name}" class="testimonial-avatar" />
          <div class="testimonial-meta">
            <h5 class="author-name">${t.name}</h5>
            <span class="author-role">${t.role}</span>
          </div>
        </div>
      </div>
    `;
  }
};

window.Components = Components;
