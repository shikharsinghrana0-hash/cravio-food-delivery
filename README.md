# Cravio | What Are You Craving Today?
### Lead Architect & Developer: **SHIKHAR SINGH RANA**

**Cravio** is a modern, responsive, high-energy Food Delivery System website inspired by **ChefDesk**, **Magnific Bistro**, **Phygital Kitchen Labs**, and **Pinterest fine-dining editorial design**.

Built with pure, modern HTML5, CSS3, and vanilla ES6+ modular JavaScript. Works instantly in any browser with **zero external runtime dependencies, zero build steps, and full offline/local compatibility**. All prices and transactions are configured in **Indian Rupees (₹)**.

---

## 📸 Screenshots Gallery

All high-resolution application screenshots are saved in the [`screenshot/`](./screenshot) directory:

| Screenshot | Description | Preview |
| :--- | :--- | :--- |
| **01-desktop-hero.png** | Desktop Hero banner, Cravio Logo, Delivery Zone & Quick Search | [View Screenshot](./screenshot/01-desktop-hero.png) |
| **02-desktop-restaurants.png** | Curated Partner Kitchens (ChefDesk, Magnific, Phygital, Trattoria) | [View Screenshot](./screenshot/02-desktop-restaurants.png) |
| **03-desktop-food-menu.png** | Food Menu with dynamic category carousel, price range slider & sorting | [View Screenshot](./screenshot/03-desktop-food-menu.png) |
| **04-desktop-cart-drawer.png** | Interactive slide-out cart drawer with free delivery meter in Indian Rupees (₹) | [View Screenshot](./screenshot/04-desktop-cart-drawer.png) |
| **05-live-order-tracking.png** | Real-time 4-stage order stepper with animated HTML5 Canvas 2D GPS road simulation | [View Screenshot](./screenshot/05-live-order-tracking.png) |
| **06-footer-developer-attribution.png** | Clean Footer with Architect & Developer attribution for **SHIKHAR SINGH RANA** | [View Screenshot](./screenshot/06-footer-developer-attribution.png) |
| **07-full-page-desktop.png** | Complete full-length scrollable capture of the desktop website | [View Screenshot](./screenshot/07-full-page-desktop.png) |
| **08-mobile-iphone-homepage.png** | iPhone responsive mobile view with fixed Glassmorphism Mobile Bottom Navigation Bar | [View Screenshot](./screenshot/08-mobile-iphone-homepage.png) |
| **09-mobile-iphone-menu.png** | Mobile food menu with single-column touch cards and stepper controls | [View Screenshot](./screenshot/09-mobile-iphone-menu.png) |

---

## 💡 Why the Name "CRAVIO"?

- **Comes Naturally to Everyone's Lips**: When people get hungry, their first thought is *"What am I craving today?"*. **Cravio** captures that universal instinct in two punchy, memorable syllables (`Cra-vi-o`).
- **Catchy & Creative**: Friendly, modern, and memorable like Swiggy, Zomato, or Deliveroo.
- **Humanized & Warm**: Instead of a dry software name, it directly invites foodies into satisfying their appetite with love and care.

---

## 👨‍💻 Developer Information
- **Lead Developer**: **SHIKHAR SINGH RANA**
- **Role**: Lead Full-Stack Web Developer & UI/UX Architect
- **Special Creator Promo Code**: Use voucher **`SHIKHAR`** at checkout for flat **₹100 Off**!

---

## 🌟 Key Features

1. **Brand Identity**: **Cravio** (partnered with premier culinary studios *ChefDesk Atelier*, *Magnific Bistro*, and *Phygital Kitchen Labs*).
2. **Custom Mascot Logo**: Stylized, smiling **"C"** vector mark with a tilted chef's toque hat and a flavor sparkle star.
3. **Indian Rupee (₹) Pricing**: Real-world gourmet pricing (pizzas ₹479–₹699, wagyu burgers ₹429–₹599, ramen ₹449–₹549, desserts ₹279–₹329, beverages ₹169–₹229).
4. **Dynamic In-Card Steppers**: Cards transform their "Add" button into interactive `[-] [qty] [+]` steppers when added to the cart.
5. **Interactive Live Delivery Tracker**: 4-stage order status stepper with an **animated HTML5 Canvas GPS map** simulating a courier vehicle traveling from the kitchen to the customer's address.
6. **Web Audio API Sound Effects**: Synthesized crystalline chimes for adding items, applying discount vouchers, and order confirmation.
7. **Particle Canvas Confetti**: Custom celebratory burst upon checkout completion.
8. **LocalStorage Persistence**: Cart, Wishlist favorites, order history, applied vouchers, tips, and dark/light theme preferences remain saved across browser reloads.
9. **Desktop & Mobile Responsive Layout**: Full desktop wide grid alongside mobile phone bottom navigation bar with safe-area spacing.

---

## 📁 Project Structure

```
delivery-site/
├── index.html              # Semantic HTML5 master document, native <dialog> modals, drawers
├── package.json            # Scripts & project metadata
├── README.md               # Complete documentation with screenshot gallery & run instructions
├── .gitignore              # Git ignore rules for node_modules and system files
├── server.py               # Zero-cache Python HTTP server
├── css/
│   ├── style.css           # Design tokens, color palettes, reset, typography, buttons
│   ├── components.css      # Header, Hero, Promo cards, Restaurant cards, Food cards, Drawers, Modals
│   └── responsive.css      # Mobile & tablet breakpoints, mobile bottom navigation bar
├── js/
│   ├── data.js             # Master dataset in ₹ (8 curated restaurants, 24 gourmet dishes, 4 vouchers)
│   ├── state.js            # Reactive state management with pub/sub event bus & LocalStorage sync
│   ├── utils.js            # Indian Rupee currency formatter, Web Audio chimes, Toast alerts, Canvas Confetti
│   ├── components.js       # Dynamic UI renderers for food cards, restaurants, vouchers, cart items
│   ├── tracker.js          # Live order tracker & Canvas GPS road path simulation
│   └── app.js              # Application controller, search, filters, modals, drawer & checkout logic
├── scripts/
│   └── capture.js          # Automated headless browser screenshot generator
└── screenshot/             # High-resolution screenshots of all views and devices
    ├── 01-desktop-hero.png
    ├── 02-desktop-restaurants.png
    ├── 03-desktop-food-menu.png
    ├── 04-desktop-cart-drawer.png
    ├── 05-live-order-tracking.png
    ├── 06-footer-developer-attribution.png
    ├── 07-full-page-desktop.png
    ├── 08-mobile-iphone-homepage.png
    └── 09-mobile-iphone-menu.png
```

---

## 🎟️ Active Voucher Codes (in ₹)

| Voucher Code | Benefit | Minimum Order |
| :--- | :--- | :--- |
| **`SHIKHAR`** | **Flat ₹100 Off** (Developer's Special) | ₹399 |
| **`CHEF20`** | **20% Off** on fine dining orders | ₹699 |
| **`FREEDEL`** | **Free Delivery** (White-Glove Courier) | ₹499 |
| **`MAGNIFIC`** | **Flat ₹150 Off** on luxury dining orders | ₹899 |

---

## 🚀 How to Run Locally

### 🌐 1. Live Server
Run the local server:
```bash
python3 server.py
```
Open in your browser:
👉 **[http://localhost:8081](http://localhost:8081)**

### 📂 2. Direct File Access
Open [index.html](file:///Users/shikharsinghrana/Documents/delivery%20site/index.html) directly in any modern web browser.
