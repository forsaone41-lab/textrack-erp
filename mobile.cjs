const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5189/');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'C:/Users/hp/AppData/Local/Temp/claude/c--Users-hp-Downloads-BEYA/232cd9c0-5ce7-4f5d-96fb-314b04eacff4/scratchpad/mobile-full.png', fullPage: true });
  await page.screenshot({ path: 'C:/Users/hp/AppData/Local/Temp/claude/c--Users-hp-Downloads-BEYA/232cd9c0-5ce7-4f5d-96fb-314b04eacff4/scratchpad/mobile-view.png' });
  await browser.close();
})();
