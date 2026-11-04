import assert from 'node:assert/strict';
import { once } from 'node:events';
import { brotliCompressSync } from 'node:zlib';
import { chromium } from 'playwright-core';
import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ host: '127.0.0.1', port: 45739 });
await once(server, 'listening');
const requested = Promise.withResolvers();
const release = Promise.withResolvers();
let browser;
const frame = height => ({ payload_id: '0x01', index: 0, base: { block_number: String(height), timestamp: String(Math.floor(Date.now() / 1000)) }, diff: { transactions: [] }, metadata: { receipts: {} } });
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }), args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.abort();
    if (url.pathname.endsWith('.wasm')) { requested.resolve(); await release.promise; }
    return route.continue().catch(() => {});
  });
  await page.addInitScript(() => { const WS = window.WebSocket; window.WebSocket = new Proxy(WS, { construct(target, args, newTarget) { args[0] = 'ws://127.0.0.1:45739/mainnet'; return Reflect.construct(target, args, newTarget); } }); });
  const connection = once(server, 'connection', { signal: AbortSignal.timeout(10000) });
  const response = await page.goto('http://127.0.0.1:45738/', { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200);
  const [socket] = await connection;
  socket.send(brotliCompressSync(Buffer.from(JSON.stringify(frame(42001)))));
  await Promise.race([requested.promise, new Promise((_, reject) => setTimeout(() => reject(new Error('WASM not requested')), 10000))]);
  socket.send(JSON.stringify(frame(42002)));
  await page.getByText('Block 42002#1', { exact: true }).waitFor({ timeout: 15000 });
  console.log('PASS: a stalled WASM fetch is aborted and later text frames are processed');
} catch (error) { console.error('Decoder stall smoke failed:', error); process.exitCode = 1; }
finally { release.resolve(); if (browser) await browser.close(); for (const client of server.clients) client.terminate(); await new Promise(resolve => server.close(resolve)); }
