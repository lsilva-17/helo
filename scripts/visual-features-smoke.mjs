import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const expectedCapabilities = [
  'theme-toggle',
  'expanded-fonts',
  'text-color',
  'section-background-color',
  'button-background-color',
  'button-text-color',
  'text-box-width',
  'text-direct-resize',
  'editable-fallback-treatment-cards',
];

const browser = await chromium.launch({headless: true});
const context = await browser.newContext();
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];

page.on('pageerror', (error) => pageErrors.push(error.stack || error.message || String(error)));
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

async function openHomepage() {
  const response = await page.goto(`${baseUrl}/`, {waitUntil: 'domcontentloaded', timeout: 45_000});
  if (!response || response.status() >= 400) throw new Error(`Homepage returned HTTP ${response?.status() ?? 'unknown'}`);
  await page.locator('body').waitFor({state: 'visible', timeout: 10_000});
}

try {
  await openHomepage();

  const capabilities = (await page.locator('body').getAttribute('data-visual-capabilities') || '').split(/\s+/).filter(Boolean);
  for (const capability of expectedCapabilities) {
    if (!capabilities.includes(capability)) throw new Error(`Missing deployed visual capability: ${capability}`);
  }

  const toggle = page.getByTestId('theme-toggle');
  await toggle.waitFor({state: 'visible', timeout: 10_000});
  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await toggle.click();
  await page.waitForTimeout(150);
  const changedTheme = await page.locator('html').getAttribute('data-theme');
  if (!changedTheme || changedTheme === initialTheme) throw new Error('Theme toggle did not change the active theme.');

  await page.reload({waitUntil: 'domcontentloaded', timeout: 45_000});
  await page.locator('body').waitFor({state: 'visible', timeout: 10_000});
  const persistedTheme = await page.locator('html').getAttribute('data-theme');
  if (persistedTheme !== changedTheme) throw new Error('Theme choice did not persist after reload.');

  const apiResponse = await context.request.get(`${baseUrl}/api/visual-customization`);
  if (!apiResponse.ok()) throw new Error(`/api/visual-customization returned HTTP ${apiResponse.status()}`);
  const payload = await apiResponse.json();
  if (!Array.isArray(payload.buttonStyles) || !Array.isArray(payload.textWidths)) {
    throw new Error('Visual customization API did not return buttonStyles/textWidths arrays.');
  }

  if (pageErrors.length) throw new Error(`Page errors:\n${pageErrors.join('\n---\n')}`);
  if (consoleErrors.some((error) => /application error|uncaught|typeerror|referenceerror/i.test(error))) {
    throw new Error(`Relevant console errors:\n${consoleErrors.join('\n---\n')}`);
  }

  console.log(`Visual feature QA passed for ${baseUrl}`);
  console.log(`Capabilities: ${capabilities.join(', ')}`);
  console.log(`Theme persisted as: ${persistedTheme}`);
} finally {
  await browser.close();
}
