import { chromium } from 'playwright';
import { preview } from 'vite';
import { readFile, mkdir } from 'node:fs/promises';
const catalog = JSON.parse(await readFile(new URL('../examples.json', import.meta.url), 'utf8'));
const server = await preview({ preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
  for (const app of catalog) {
    // Capture the actual app surface with deterministic demo data; no mockup images.
    const url = new URL(app.applicationUrl); url.searchParams.set('demo', '1'); url.searchParams.set('capture', '1');
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/${url.search}`);
    await page.waitForSelector('body[data-synchronized="true"]');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: new URL(`../docs/${app.slug}.png`, import.meta.url).pathname });
    console.log(`Captured ${app.slug}.png`);
  }
} finally { await browser.close(); await new Promise(resolve => server.httpServer.close(resolve)); }
