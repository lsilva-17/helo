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
  'matched-block-heights',
  'floating-social-links',
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

  const heroCard = page.locator('.hero-card');
  const heroPhoto = page.locator('.hero-photo');
  if (await heroCard.count() && await heroPhoto.count()) {
    const [cardBox, photoBox] = await Promise.all([heroCard.boundingBox(), heroPhoto.boundingBox()]);
    if (!cardBox || !photoBox) throw new Error('Unable to measure hero blocks.');
    if (Math.abs(cardBox.height - photoBox.height) > 2) {
      throw new Error(`Hero blocks are not height-matched: text=${cardBox.height}px image=${photoBox.height}px`);
    }
  }

  const galleryCards = page.locator('.gallery-card');
  const galleryCount = await galleryCards.count();
  if (galleryCount > 1) {
    const heights = [];
    for (let i = 0; i < galleryCount; i++) {
      const box = await galleryCards.nth(i).boundingBox();
      if (box) heights.push(Math.round(box.height));
    }
    if (heights.length > 1 && Math.max(...heights) - Math.min(...heights) > 2) {
      throw new Error(`Treatment cards are not height-matched: ${heights.join(', ')}`);
    }
  }

  const socialLinks = page.locator('.social-float-link');
  if (await socialLinks.count() < 1) throw new Error('Floating social links are missing.');
  const whatsappHref = await page.locator('.social-float-whatsapp').getAttribute('href');
  if (!whatsappHref || !whatsappHref.includes('wa.me/')) throw new Error('Floating WhatsApp link is invalid.');
  const instagramLink = page.locator('.social-float-instagram');
  if (await instagramLink.count()) {
    const instagramHref = await instagramLink.getAttribute('href');
    if (!instagramHref || !/instagram\.com/i.test(instagramHref)) throw new Error('Floating Instagram link is invalid.');
  }

  const heroTitle = page.locator('[data-vb-font-field="heroTitleFont"]').first();
  if (await heroTitle.count()) {
    const fontFamily = await heroTitle.evaluate((el) => getComputedStyle(el).fontFamily);
    if (!fontFamily) throw new Error('Hero title font is not computed.');
  }

  const brandLogo = page.locator('[data-vb-image-field="brandLogo"]').first();
  if (await brandLogo.count()) {
    const src = await brandLogo.getAttribute('src');
    if (!src) throw new Error('Brand logo does not expose a source.');
  }

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
