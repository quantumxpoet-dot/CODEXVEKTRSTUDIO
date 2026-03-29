import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000/#/library');
  
  console.log('Setting file...');
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('C:\\01_VEKTR_studio\\tmp\\test.mp4');
  
  console.log('Waiting 3s for upload logic...');
  await page.waitForTimeout(3000);
  
  console.log('Checking state...');
  const buttons = await page.locator('button').allTextContents();
  console.log('Buttons:', buttons);
  
  await browser.close();
})();
