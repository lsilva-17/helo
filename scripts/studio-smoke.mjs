import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({headless: true});
const page = await browser.newPage();
const pageErrors = [];
const consoleErrors = [];
const failedRequests = [];

page.on('pageerror', (error) => {
  pageErrors.push(error.stack || error.message || String(error));
});

page.on('console', (message) => {
  if (message.type() === 'error') {
    consoleErrors.push(message.text());
  }
});

page.on('requestfailed', (request) => {
  failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`);
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

  if (pageErrors.length > 0) {
    throw new Error([
      'Studio emitted page errors:',
      ...pageErrors,
      consoleErrors.length ? `Console errors:\n${consoleErrors.join('\n---\n')}` : '',
      failedRequests.length ? `Failed requests:\n${failedRequests.join('\n---\n')}` : '',
      `Body:\n${body.slice(0, 1200)}`,
    ].filter(Boolean).join('\n\n'));
  }

  if (/Application error: a client-side exception/i.test(body)) {
    throw new Error([
      `Studio rendered Next.js client-side exception screen. Body: ${body.slice(0, 1200)}`,
      consoleErrors.length ? `Console errors:\n${consoleErrors.join('\n---\n')}` : '',
      failedRequests.length ? `Failed requests:\n${failedRequests.join('\n---\n')}` : '',
    ].filter(Boolean).join('\n\n'));
  }

  console.log('Studio browser smoke test passed.');
} finally {
  await browser.close();
}
