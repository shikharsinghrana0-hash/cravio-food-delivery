const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Users/shikharsinghrana/.cache/puppeteer/chrome/mac_arm-157.0.8103.78/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshot');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching headless Chrome for Testing...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Helper to clear any toast alerts from viewport
  async function clearToasts() {
    await page.evaluate(() => {
      document.querySelectorAll('.toast').forEach(t => t.remove());
    });
  }

  // 1. Desktop Full Viewport & Hero (Clean Header, No Crown, No Dev Badge at Top)
  console.log('Capturing Desktop Hero & Navigation...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  await clearToasts();
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'live-01-hero-desktop.png') });

  // 2. Desktop Partner Kitchens Section (ChefDesk, Magnific, Phygital)
  console.log('Capturing Partner Kitchens section...');
  const restaurantsEl = await page.$('#restaurants-section');
  if (restaurantsEl) {
    await clearToasts();
    await restaurantsEl.screenshot({ path: path.join(OUTPUT_DIR, 'live-02-kitchens.png') });
  }

  // 3. Desktop Food Menu & Dynamic Real-time Filters
  console.log('Capturing Food Menu and Filters...');
  const menuEl = await page.$('#menu-section');
  if (menuEl) {
    await clearToasts();
    await menuEl.screenshot({ path: path.join(OUTPUT_DIR, 'live-03-menu-filters.png') });
  }

  // 4. Slide-out Cart Drawer with Live Steppers and Indian Rupees
  console.log('Capturing Cart Drawer with live calculations in ₹...');
  await page.evaluate(() => {
    if (window.App && window.App.quickAddToCart) {
      window.App.quickAddToCart('piz-veg-01');
      window.App.quickAddToCart('trn-veg-02');
      window.App.openCartDrawer();
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await clearToasts();
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'live-04-cart-drawer.png') });

  // Close cart drawer
  await page.evaluate(() => {
    if (window.App && window.App.closeCartDrawer) {
      window.App.closeCartDrawer();
    }
  });
  await new Promise(r => setTimeout(r, 400));

  // 5. Live Order Tracking Modal with 2D Canvas Road Network & Courier
  console.log('Capturing Live GPS Order Tracking Modal...');
  await page.evaluate(() => {
    // Add item and place order cleanly
    window.state.addToCart('piz-veg-01', 1);
    const order = window.state.createOrder({
      customerName: "Aarav Sharma",
      phone: "+91 98765 43210",
      address: "Tower 4B, DLF Cyber City, Cyber Hub",
      notes: "Please deliver with thermal insulation packaging",
      paymentMethod: "upi"
    });
    if (window.App && window.App.trackOrder && order) {
      window.App.trackOrder(order.id);
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await clearToasts();
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'live-05-order-tracking.png') });

  // Close modal
  await page.evaluate(() => {
    const dialog = document.getElementById('order-tracking-modal');
    if (dialog) dialog.close();
  });
  await new Promise(r => setTimeout(r, 400));

  // 6. Footer Attribution at the bottom ("At Last" - simple architect & developer format, NO crown)
  console.log('Capturing Footer with simple clean attribution at the bottom...');
  const footerEl = await page.$('.site-footer');
  if (footerEl) {
    await clearToasts();
    await footerEl.screenshot({ path: path.join(OUTPUT_DIR, 'live-06-footer-attribution.png') });
  }

  // 7. Full-Page Scrollable Capture
  console.log('Capturing Full-Page Desktop view...');
  await clearToasts();
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'live-07-full-page-desktop.png'), fullPage: true });

  // 8. Mobile iPhone View (390 x 844) with Bottom Navigation Bar
  console.log('Capturing Mobile iPhone View with Mobile Bottom Navigation Bar...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));
  await clearToasts();
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'live-08-mobile-homepage.png') });

  // 9. Mobile Food Menu view
  console.log('Capturing Mobile Food Menu view...');
  await page.evaluate(() => {
    const el = document.getElementById('menu-section');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await clearToasts();
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'live-09-mobile-menu.png') });

  // 10. Trending Pizzas & Coffees View (Desktop)
  console.log('Capturing Trending Pizzas & Coffees view...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => {
    if (window.state && window.state.setFilter) {
      window.state.setFilter('category', 'trending');
    }
    const el = document.getElementById('menu-section');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await clearToasts();
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'live-10-trending-pizzas.png') });

  console.log('All fresh live screenshots captured successfully into screenshot/ !');
  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
