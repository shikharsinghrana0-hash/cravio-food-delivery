/**
 * L'ÉTOILE & TABLE - CHEFDESK & MAGNIFIC GOURMET
 * Interactive Delivery Tracker & Real-Time Animated Route Simulation
 */

class DeliveryTracker {
  constructor() {
    this.timerInterval = null;
    this.animationFrame = null;
    this.progress = 0; // 0 to 100
  }

  // Render the Tracking UI inside a modal or dedicated container
  renderTracker(order) {
    const statusSteps = [
      { key: "confirmed", label: "Order Confirmed", time: "Just now", icon: "✓" },
      { key: "kitchen", label: "Chef Preparing Meal", time: "+8 min", icon: "🍳" },
      { key: "on_way", label: "Courier On The Way", time: "+18 min", icon: "🛵" },
      { key: "delivered", label: "Arrived & Delivered", time: "~28 min", icon: "🎉" }
    ];

    const currentIdx = statusSteps.findIndex(s => s.key === order.status);
    const activeIndex = currentIdx >= 0 ? currentIdx : 0;

    return `
      <div class="tracker-wrapper">
        <!-- Tracker Header -->
        <div class="tracker-header">
          <div class="tracker-header-info">
            <span class="badge badge-accent">Live GPS Tracking</span>
            <h2 class="tracker-order-id">Order #${order.id}</h2>
            <p class="tracker-placed-time">Placed at ${Utils.formatDate(order.date)}</p>
          </div>
          <div class="tracker-eta-badge">
            <span class="eta-label">Estimated Delivery</span>
            <span class="eta-time" id="tracker-eta-timer">24 mins</span>
          </div>
        </div>

        <!-- Live Status Stepper -->
        <div class="order-stepper">
          ${statusSteps
            .map((step, idx) => {
              const isPassed = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const stateClass = isPassed ? "step-passed" : isCurrent ? "step-active" : "step-pending";

              return `
              <div class="stepper-step ${stateClass}">
                <div class="step-icon-circle">
                  ${isPassed ? "✓" : step.icon}
                </div>
                <div class="step-label-wrap">
                  <span class="step-title">${step.label}</span>
                  <span class="step-time">${step.time}</span>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>

        <!-- Interactive Map Visual Canvas -->
        <div class="tracker-map-card">
          <div class="map-header-overlay">
            <div class="map-pulse-dot"></div>
            <span>GPS Sensor Active • Encrypted Courier Dispatch</span>
          </div>
          <canvas id="delivery-map-canvas" width="700" height="260"></canvas>
          <div class="map-locations-overlay">
            <div class="map-pin map-pin-restaurant">
              <span class="pin-symbol">🍽️</span>
              <span class="pin-text">${order.items[0]?.restaurantName || "Kitchen Studio"}</span>
            </div>
            <div class="map-pin map-pin-customer">
              <span class="pin-symbol">📍</span>
              <span class="pin-text">${order.customer.name}'s Residence</span>
            </div>
          </div>
        </div>

        <!-- Courier Driver Info Card -->
        <div class="courier-card">
          <div class="courier-profile">
            <img src="${order.driver.photo}" alt="${order.driver.name}" class="courier-photo" />
            <div class="courier-details">
              <h4 class="courier-name">${order.driver.name}</h4>
              <p class="courier-vehicle">${order.driver.vehicle} • ★ ${order.driver.rating.toFixed(2)} (950+ deliveries)</p>
              <p class="courier-status">Temperature Bag: 62°C Thermal Regulated</p>
            </div>
          </div>
          <div class="courier-actions">
            <a href="tel:${order.driver.phone}" class="btn btn-outline-sm btn-icon-round" title="Call Courier">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Call</span>
            </a>
            <button type="button" class="btn btn-outline-sm btn-icon-round" onclick="Utils.showToast('Driver Chat', 'Driver Marco: Hello! I have just secured your thermal bag.', 'info')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Message</span>
            </button>
          </div>
        </div>

        <!-- Destination Address Box -->
        <div class="delivery-address-box">
          <div class="address-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="address-content">
            <h5 class="address-recipient">Delivering to: ${order.customer.name} (${order.customer.phone})</h5>
            <p class="address-full">${order.customer.address}</p>
            <p class="address-notes"><em>Instructions: ${order.customer.notes}</em></p>
          </div>
        </div>

        <!-- Itemized Order Summary Accordion -->
        <div class="tracker-order-summary">
          <h4 class="summary-toggle-title">Order Items (${order.items.reduce((s, i) => s + i.quantity, 0)})</h4>
          <div class="tracker-items-list">
            ${order.items
              .map(
                item => `
              <div class="tracker-item-row">
                <span class="tracker-item-qty">${item.quantity}x</span>
                <span class="tracker-item-name">${item.name}</span>
                <span class="tracker-item-price">${Utils.formatCurrency(item.price * item.quantity)}</span>
              </div>
            `
              )
              .join("")}
          </div>
          <div class="tracker-pricing-breakdown">
            <div class="tracker-price-line">
              <span>Subtotal</span>
              <span>${Utils.formatCurrency(order.pricing.subtotal)}</span>
            </div>
            ${
              order.pricing.discount > 0
                ? `
              <div class="tracker-price-line discount-line">
                <span>Voucher Discount</span>
                <span>-${Utils.formatCurrency(order.pricing.discount)}</span>
              </div>
            `
                : ""
            }
            <div class="tracker-price-line">
              <span>Delivery Fee</span>
              <span>${order.pricing.deliveryFee === 0 ? "FREE" : Utils.formatCurrency(order.pricing.deliveryFee)}</span>
            </div>
            <div class="tracker-price-line">
              <span>Tax & Platform Fee</span>
              <span>${Utils.formatCurrency(order.pricing.tax)}</span>
            </div>
            ${
              order.pricing.tip > 0
                ? `
              <div class="tracker-price-line">
                <span>Courier Tip</span>
                <span>${Utils.formatCurrency(order.pricing.tip)}</span>
              </div>
            `
                : ""
            }
            <div class="tracker-price-line grand-total-line">
              <span>Total Paid</span>
              <span>${Utils.formatCurrency(order.pricing.total)}</span>
            </div>
          </div>
        </div>

        <!-- Tracker Footer Actions -->
        <div class="tracker-actions-row">
          <button type="button" class="btn btn-secondary" onclick="window.print()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print Receipt
          </button>
          <button type="button" class="btn btn-primary" id="btn-back-to-browse">
            Continue Browsing
          </button>
        </div>
      </div>
    `;
  }

  // Initialize Canvas Animation for stylized courier movement along road curve
  startMapSimulation(order) {
    const canvas = document.getElementById("delivery-map-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let t = 0.25; // 0 (restaurant) to 1 (customer)
    let direction = 1;

    // Responsive Canvas Resizing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = 240 * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resizeCanvas();

    const drawMap = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = 240;

      ctx.clearRect(0, 0, w, h);

      // Map Background (Stylized dark or light city grid)
      const isDark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDark ? "#0f172a" : "#f1f5f9";
      ctx.fillRect(0, 0, w, h);

      // Subtle City Grid Blocks
      ctx.strokeStyle = isDark ? "#1e293b" : "#e2e8f0";
      ctx.lineWidth = 1;
      for (let x = 20; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 20; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Bezier Road Path: Restaurant (left) to Customer (right)
      const p0 = { x: 70, y: 170 };
      const p1 = { x: w * 0.35, y: 50 };
      const p2 = { x: w * 0.65, y: 200 };
      const p3 = { x: w - 80, y: 80 };

      // Draw Main Road
      ctx.strokeStyle = isDark ? "#334155" : "#cbd5e1";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.stroke();

      // Route Highlight Line (Glowing Gourmet Orange)
      ctx.strokeStyle = "#FF5722";
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Calculate Current Courier Position on Cubic Bezier
      const getBezierPoint = progress => {
        const u = 1 - progress;
        const tt = progress * progress;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * progress;

        let x = uuu * p0.x + 3 * uu * progress * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
        let y = uuu * p0.y + 3 * uu * progress * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
        return { x, y };
      };

      const courierPos = getBezierPoint(t);

      // Draw Delivery Pulse Circle around Courier
      const pulseSize = 14 + Math.sin(Date.now() / 200) * 4;
      ctx.fillStyle = "rgba(255, 87, 34, 0.25)";
      ctx.beginPath();
      ctx.arc(courierPos.x, courierPos.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw Courier Pin / Vehicle Circle
      ctx.fillStyle = "#FF5722";
      ctx.beginPath();
      ctx.arc(courierPos.x, courierPos.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Restaurant Pin (Start)
      ctx.fillStyle = "#10B981";
      ctx.beginPath();
      ctx.arc(p0.x, p0.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Customer Pin (Finish)
      ctx.fillStyle = "#E63946";
      ctx.beginPath();
      ctx.arc(p3.x, p3.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Progress animation
      t += 0.0018 * direction;
      if (t >= 0.88) {
        direction = -0.5; // slow drift
      } else if (t <= 0.35) {
        direction = 1;
      }

      this.animationFrame = requestAnimationFrame(drawMap);
    };

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    drawMap();
  }

  stopMapSimulation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

window.DeliveryTracker = new DeliveryTracker();
