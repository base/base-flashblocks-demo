import assert from 'node:assert/strict';
import { once } from 'node:events';
import { brotliCompressSync } from 'node:zlib';
import { chromium } from 'playwright-core';
import { WebSocketServer } from 'ws';

const appUrl = 'http://127.0.0.1:45738/';
const wsPort = 45739;
const server = new WebSocketServer({ host: '127.0.0.1', port: wsPort });
await once(server, 'listening');
let browser;
const pageErrors = [];

const message = (height, index = 0) => ({
  payload_id: '0x01',
  index,
  base: {
    parent_beacon_block_root: '0x00', parent_hash: '0x00', fee_recipient: '0x00',
    prev_randao: '0x00', block_number: String(height), gas_limit: '0x0',
    timestamp: String(Math.floor(Date.now() / 1000)), extra_data: '0x', base_fee_per_gas: '0x0',
  },
  diff: { state_root: '0x00', receipts_root: '0x00', logs_bloom: '0x00', gas_used: '0x0', block_hash: '0x00', transactions: [] },
  metadata: { receipts: {} },
});

const nextConnection = () => once(server, 'connection', { signal: AbortSignal.timeout(10000) });

try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }),
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
  // Redirect only the two configured public WebSocket URLs to a local fixture.
  // The browser never contacts a public endpoint or sends a transaction.
  await page.addInitScript((port) => {
    const WebSocketClass = window.WebSocket;
    window.WebSocket = new Proxy(WebSocketClass, {
      construct(target, args, newTarget) {
        const url = new URL(String(args[0]));
        if (url.hostname === 'mainnet.flashblocks.base.org') args[0] = `ws://127.0.0.1:${port}/mainnet`;
        else if (url.hostname === 'sepolia.flashblocks.base.org') args[0] = `ws://127.0.0.1:${port}/sepolia`;
        else throw new Error(`Unexpected WebSocket endpoint: ${url.hostname}`);
        return Reflect.construct(target, args, newTarget);
      },
    });
  }, wsPort);

  const initial = nextConnection();
  const response = await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200, 'local production preview should return HTTP 200');
  await page.getByRole('heading', { name: 'Flashblocks' }).waitFor();
  const [mainnet, mainnetRequest] = await initial;
  assert.equal(mainnetRequest.url, '/mainnet');
  console.log('PASS: HTTP 200 and mainnet WebSocket connects to local fixture');

  mainnet.send(JSON.stringify(message(12001)));
  await page.getByText('Block 12001#1', { exact: true }).waitFor({ timeout: 10000 });
  console.log('PASS: text JSON flashblock rendered');

  mainnet.send(brotliCompressSync(Buffer.from(JSON.stringify(message(12001, 2)))));
  await page.getByText('Block 12001#2', { exact: true }).waitFor({ timeout: 10000 });
  console.log('PASS: Brotli-compressed binary flashblock rendered');

  mainnet.send(JSON.stringify(message(12002)));
  await page.getByText('Block #12001', { exact: true }).first().waitFor({ timeout: 10000 });
  console.log('PASS: completed mainnet block rendered');

  const sepoliaConnection = nextConnection();
  await page.getByRole('button', { name: /Base Mainnet/ }).click();
  await page.getByRole('button', { name: /Base Sepolia/ }).click();
  const [, sepoliaRequest] = await sepoliaConnection;
  assert.equal(sepoliaRequest.url, '/sepolia');
  await page.getByText('Block 12001#2', { exact: true }).waitFor({ state: 'hidden', timeout: 10000 });
  await page.getByText('Block #12001', { exact: true }).first().waitFor({ state: 'hidden', timeout: 10000 });

  // Switch back without receiving any Sepolia data: old mainnet blocks must not reappear.
  const rapidMainnetConnection = nextConnection();
  await page.getByRole('button', { name: /Base Sepolia/ }).click();
  await page.getByRole('button', { name: /Base Mainnet/ }).click();
  const [, rapidMainnetRequest] = await rapidMainnetConnection;
  assert.equal(rapidMainnetRequest.url, '/mainnet');
  await page.getByText('Block #12001', { exact: true }).first().waitFor({ state: 'hidden', timeout: 10000 });
  console.log('PASS: rapid switch back does not restore stale blocks');

  const sepoliaAgainConnection = nextConnection();
  await page.getByRole('button', { name: /Base Mainnet/ }).click();
  await page.getByRole('button', { name: /Base Sepolia/ }).click();
  const [sepolia, sepoliaAgainRequest] = await sepoliaAgainConnection;
  assert.equal(sepoliaAgainRequest.url, '/sepolia');
  sepolia.send(brotliCompressSync(Buffer.from(JSON.stringify(message(22001)))));
  await page.getByText('Block 22001#1', { exact: true }).waitFor({ timeout: 10000 });
  console.log('PASS: network switch clears old blocks and renders Sepolia fixture data');

  const mainnetAgainConnection = nextConnection();
  await page.getByRole('button', { name: /Base Sepolia/ }).click();
  await page.getByRole('button', { name: /Base Mainnet/ }).click();
  const [, mainnetAgainRequest] = await mainnetAgainConnection;
  assert.equal(mainnetAgainRequest.url, '/mainnet');
  await page.getByText('Block 22001#1', { exact: true }).waitFor({ state: 'hidden', timeout: 10000 });
  assert.deepEqual(pageErrors, [], `unexpected browser errors: ${pageErrors.join('; ')}`);
  console.log('PASS: switching back clears Sepolia state; no browser page errors');
} catch (error) {
  console.error('Browser smoke failed:', error);
  if (pageErrors.length) console.error('Browser page errors:', pageErrors);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  for (const client of server.clients) client.terminate();
  await new Promise(resolve => server.close(resolve));
}
