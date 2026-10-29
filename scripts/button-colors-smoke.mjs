import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const response = await fetch(`${baseUrl}/api/visual-customization`);
assert.equal(response.ok, true, 'Saved customization must be readable');
const {buttonStyles} = await response.json();
assert.ok(buttonStyles?.length, 'Use a site with saved button colors');
const browser = await chromium.launch({headless: true});
const rgb = (hex) => `rgb(${hex.slice(1).match(/../g).map(part => parseInt(part, 16)).join(', ')})`;

async function checkColors(page) {
  let checked = 0;
  for (const button of buttonStyles) {
    const [doc, field] = button.key.split(':');
    const target = page.locator(`.btn[data-vb-doc-id="${doc}"][data-vb-field="${field}"]`);
    if (!await target.count()) continue;
    checked++;
    if (button.background) await assertStyle(target, 'background-color', rgb(button.background));
    if (button.text) await assertStyle(target, 'color', rgb(button.text));
  }
  assert.ok(checked, 'At least one saved button must be present on the page');
}

async function assertStyle(target, property, expected) {
  assert.equal(await target.evaluate((element, property) => getComputedStyle(element).getPropertyValue(property), property), expected);
}

try {
  for (const width of [1440, 390]) {
    // A visitor must see the saved colors even before any client code runs.
    const staticContext = await browser.newContext({javaScriptEnabled: false, viewport: {width, height: 1000}});
    const staticPage = await staticContext.newPage();
    await staticPage.goto(baseUrl, {waitUntil: 'load'});
    await checkColors(staticPage);
    await staticContext.close();

    const context = await browser.newContext({viewport: {width, height: 1000}});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let release;
    const gate = new Promise(resolve => {release = resolve;});
    const requestStarted = page.waitForRequest('**/api/visual-customization*');
    await page.route('**/api/visual-customization*', async route => {
      await gate;
      await route.continue();
    });
    await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
    await requestStarted;
    await checkColors(page);
    const loaded = page.waitForResponse(response => response.url().includes('/api/visual-customization'));
    release();
    await loaded;
    await page.locator('.btn-primary').waitFor();
    await page.waitForTimeout(300); // Let the existing color transition finish.
    await checkColors(page);
    assert.deepEqual(errors, [], 'Hydration must not introduce page errors');
    await context.close();
    console.log(`Button colors stable before JavaScript, during delayed customization, and after hydration at ${width}px.`);
  }
} finally {
  await browser.close();
}
