import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({headless: true});
const page = await browser.newPage();
const pageErrors = [];
const consoleErrors = [];
const failedRequests = [];

page.on('pageerror', (error) => pageErrors.push(error.stack || error.message || String(error)));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('requestfailed', (request) => {
  failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`);
});

function diagnostics(body) {
  return [
    pageErrors.length ? `Page errors:\n${pageErrors.join('\n---\n')}` : '',
    consoleErrors.length ? `Console errors:\n${consoleErrors.join('\n---\n')}` : '',
    failedRequests.length ? `Failed requests:\n${failedRequests.join('\n---\n')}` : '',
    `Body:\n${body.slice(0, 1800)}`,
  ].filter(Boolean).join('\n\n');
}

try {
  const response = await page.goto(`${baseUrl}/studio/presentation`, {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });

  if (!response || response.status() >= 400) {
    throw new Error(`Presentation route returned HTTP ${response?.status() ?? 'unknown'}`);
  }

  await page.waitForTimeout(10_000);
  const body = await page.locator('body').innerText().catch(() => '');

  if (pageErrors.length > 0) {
    throw new Error(`Presentation route emitted page errors.\n\n${diagnostics(body)}`);
  }

  if (/Application error: a client-side exception/i.test(body)) {
    throw new Error(`Presentation route rendered the Next.js client exception screen.\n\n${diagnostics(body)}`);
  }

  if (/Unable to connect, check the browser console for more information/i.test(body)) {
    throw new Error(`Presentation Tool could not connect to the preview.\n\n${diagnostics(body)}`);
  }

  const fatalConsole = consoleErrors.filter((entry) =>
    /CorsOriginError|Workspace: missing context value|useEffectEvent|Unhandled|TypeError|ReferenceError/i.test(entry),
  );
  if (fatalConsole.length) {
    throw new Error(`Presentation route emitted fatal console errors.\n\n${diagnostics(body)}`);
  }

  console.log(`Presentation browser smoke test passed for ${baseUrl}/studio/presentation`);
} finally {
  await browser.close();
}
