import assert from 'node:assert/strict';
import { once } from 'node:events';
import { brotliCompressSync } from 'node:zlib';
import { chromium } from 'playwright-core';
import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ host: '127.0.0.1', port: 45739 });
await once(server, 'listening');
let browser;
let attempts = 0;
const failed = Promise.withResolvers();
const frame = height => ({ payload_id: '0x01', index: 0, base: { block_number: String(height), timestamp: String(Math.floor(Date.now() / 1000)) }, diff: { transactions: [] }, metadata: { receipts: {} } });
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }), args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', message => { if (message.text().includes('Error decompressing data')) failed.resolve(); });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.abort();
    if (url.pathname.endsWith('.wasm') && ++attempts === 1) return route.abort();
    return route.continue();
  });
  await page.addInitScript(() => {
    // Simulate browsers where AbortSignal.any is not implemented.
    AbortSignal.any = undefined;
    const WebSocketClass = window.WebSocket;
    window.WebSocket = new Proxy(WebSocketClass, { construct(target, args, newTarget) { args[0] = 'ws://127.0.0.1:45739/mainnet'; return Reflect.construct(target, args, newTarget); } });
  });
  const connection = once(server, 'connection', { signal: AbortSignal.timeout(10000) });
  const response = await page.goto('http://127.0.0.1:45738/', { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200);
  const [socket] = await connection;
  socket.send(brotliCompressSync(Buffer.from(JSON.stringify(frame(41001)))));
  await Promise.race([failed.promise, new Promise((_, reject) => setTimeout(() => reject(new Error('expected decoder failure')), 10000))]);
  socket.send(brotliCompressSync(Buffer.from(JSON.stringify(frame(41002)))));
  await page.getByText('Block 41002#1', { exact: true }).waitFor({ timeout: 10000 });
  assert.equal(attempts, 2);
  console.log('PASS: transient decoder fetch failure is retried for the next compressed frame');
} catch (error) { console.error('Decoder retry smoke failed:', error); process.exitCode = 1; }
finally { if (browser) await browser.close(); for (const client of server.clients) client.terminate(); await new Promise(resolve => server.close(resolve)); }
