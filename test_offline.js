const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to 1280x1024
  await page.setViewportSize({ width: 1280, height: 1024 });

  // Simulate offline by blocking market data API
  await page.route('**/api/market-data**', route => route.abort());

  console.log('Navigating to http://localhost:3000 with API blocked...');
  await page.goto('http://localhost:3000');
  
  // Wait for simulation mode to trigger and data to load
  await page.waitForTimeout(5000); 

  console.log('Capturing offline/simulation screenshot...');
  await page.screenshot({ path: 'offline_dashboard.png' });

  await browser.close();
  console.log('Done.');
})();
