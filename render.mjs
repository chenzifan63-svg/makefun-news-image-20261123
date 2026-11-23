// Render frontpage.html to entry.png at exactly 1024x1024 with headless Chrome.
// Loads the page over file://, waits for window.__shotReady, saves a PNG.
// Usage: node render.mjs
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/makefun/.pw/node_modules/playwright-core');

const repo = dirname(fileURLToPath(import.meta.url));
const policyPath = '/home/hatch/workspace/makefun/.pw/webgl-policy.txt';
const sha = createHash('sha256').update(readFileSync(policyPath)).digest('hex');

const browser = await chromium.launch({
  executablePath: '/opt/meta-chromium/chrome',
  args: ['--no-sandbox', '--allow-file-access-from-files',
    `--hatch-webgl-allowed-domains-file=${policyPath}`,
    `--hatch-webgl-allowed-domains-sha256=${sha}`],
});

let consoleErrors = 0;
let pageErrors = 0;
const requests = new Set();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
page.on('console', (msg) => {
  if (msg.type() === 'error') { consoleErrors += 1; console.log('  console.error:', msg.text()); }
});
page.on('pageerror', (err) => { pageErrors += 1; console.log('  pageerror:', String(err)); });
page.on('request', (req) => requests.add(req.url()));
await page.goto(`file://${join(repo, 'frontpage.html')}`);
await page.waitForFunction(() => window.__shotReady, null, { timeout: 20000 });
const out = join(repo, 'entry.png');
await page.screenshot({ path: out, type: 'png' });
await browser.close();
const size = statSync(out).size;
console.log(`entry.png: ${size} bytes${size > 1048576 ? '  OVER 1 MiB!' : ''}`);
console.log(`console errors: ${consoleErrors}, page errors: ${pageErrors}`);
const nonLocal = [...requests].filter((u) => !u.startsWith('file://'));
console.log(nonLocal.length === 0 ? 'all requests are local files' : `NON-LOCAL REQUESTS: ${nonLocal.join(', ')}`);
