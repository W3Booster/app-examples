import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';
const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const address = server.httpServer.address();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const view of ['dashboard', 'resources', 'settings', 'overlay', 'compact']) {
    await page.goto(`http://127.0.0.1:${address.port}/?demo=1&view=${view}`);
    await page.waitForSelector('body[data-synchronized="true"]');
    assert.match(await page.locator('.content').innerText(), view === 'settings' ? /App title/ : /Northwind/);
    assert.equal(await page.getByRole('button', { name: 'Open compact window', includeHidden: true }).isDisabled(), true);
    if (view === 'overlay') assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgba(0, 0, 0, 0)');
  }
  for (const [scenario, expected] of [['no-match', 'Waiting for a match'], ['missing-data', 'Resource data is unavailable'], ['teams', 'Moonrise'], ['finished', 'Match finished']]) {
    await page.goto(`http://127.0.0.1:${address.port}/?demo=1&scenario=${scenario}&view=${scenario === 'missing-data' ? 'resources' : 'dashboard'}`);
    await page.waitForSelector('body[data-synchronized="true"]');
    assert.ok((await page.locator('.content').innerText()).includes(expected), scenario);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.goto(`http://127.0.0.1:${address.port}/?demo=0`);
  await page.getByText('Opening localhost directly does not authorize live data.', { exact: false }).waitFor();
  assert.equal(await page.locator('.badge').innerText(), 'LIVE CONNECTION');
  assert.deepEqual(errors, []);
  console.log('All examples, scenarios, mobile layout, and unauthorized live startup passed.');
} finally { await browser.close(); await new Promise(resolve => server.httpServer.close(resolve)); }
