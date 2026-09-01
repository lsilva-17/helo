import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({headless: true});
const page = await browser.newPage();
const pageErrors = [];

page.on('pageerror', (error) => {
  pageErrors.push(error.stack || error.message || String(error));
});

try {
  const response = await page.goto(`${baseUrl}/studio`, {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });

  if (!response || response.status() >= 400) {
    throw new Error(`Studio returned HTTP ${response?.status() ?? 'unknown'}`);
  }

  await page.waitForTimeout(8_000);
  const body = await page.locator('body').innerText().catch(() => '');

  if (/Application error: a client-side exception/i.test(body)) {
    throw new Error(`Studio rendered Next.js client-side exception screen. Body: ${body.slice(0, 600)}`);
  }

  if (pageErrors.length > 0) {
    throw new Error(`Studio emitted page errors:\n${pageErrors.join('\n---\n')}`);
  }

  console.log('Studio browser smoke test passed.');
} finally {
  await browser.close();
}
