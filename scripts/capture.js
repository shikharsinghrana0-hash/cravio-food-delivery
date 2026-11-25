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

  // 1. Desktop Full Viewport & Hero
  console.log('Capturing Desktop Hero & Navigation...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01-desktop-hero.png') });

  // 2. Desktop Restaurants / Kitchens Section
  console.log('Capturing Partner Kitchens section...');
  const restaurantsEl = await page.$('#restaurants-section');
  if (restaurantsEl) {
    await restaurantsEl.screenshot({ path: path.join(OUTPUT_DIR, '02-desktop-restaurants.png') });
  }

  // 3. Desktop Food Menu & Filter Toolbar
  console.log('Capturing Food Menu and Filters...');
  const menuEl = await page.$('#menu-section');
  if (menuEl) {
    await menuEl.screenshot({ path: path.join(OUTPUT_DIR, '03-desktop-food-menu.png') });
  }

  // 4. Slide-out Cart Drawer with Items
  console.log('Capturing Cart Drawer with Indian Rupees calculation...');
  // Add a couple items to cart via quickAddToCart
  await page.evaluate(() => {
    if (window.App && window.App.quickAddToCart) {
      window.App.quickAddToCart('pizza-1');
      window.App.quickAddToCart('burger-1');
      window.App.openCartDrawer();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04-desktop-cart-drawer.png') });

  // Close cart drawer
  await page.evaluate(() => {
    if (window.App && window.App.closeCartDrawer) {
      window.App.closeCartDrawer();
    }
  });
  await new Promise(r => setTimeout(r, 400));

  // 5. Live Order Tracking Modal with Canvas 2D
  console.log('Capturing Live GPS Order Tracking Modal...');
  await page.evaluate(() => {
    if (window.App && window.App.trackOrder) {
      window.App.trackOrder('ORD-DEMO');
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05-live-order-tracking.png') });

  // Close modal
  await page.evaluate(() => {
    const dialog = document.getElementById('order-tracking-modal');
    if (dialog) dialog.close();
  });
  await new Promise(r => setTimeout(r, 400));

  // 6. Footer with Clean Developer Attribution
  console.log('Capturing Footer with clean Architect & Developer attribution...');
  const footerEl = await page.$('.site-footer');
  if (footerEl) {
    await footerEl.screenshot({ path: path.join(OUTPUT_DIR, '06-footer-developer-attribution.png') });
  }

  // 7. Full-Page Scrollable Capture
  console.log('Capturing Full-Page Desktop view...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07-full-page-desktop.png'), fullPage: true });

  // 8. Mobile iPhone View (390 x 844) with Bottom Navigation Bar
  console.log('Capturing Mobile iPhone View with Mobile Bottom Navigation Bar...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08-mobile-iphone-homepage.png') });

  // 9. Mobile Food Menu view
  console.log('Capturing Mobile Food Menu view...');
  await page.evaluate(() => {
    const el = document.getElementById('menu-section');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09-mobile-iphone-menu.png') });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
