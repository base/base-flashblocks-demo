import assert from 'node:assert/strict';
import { once } from 'node:events';
import { brotliCompressSync } from 'node:zlib';
import { chromium } from 'playwright-core';
import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ host: '127.0.0.1', port: 45739 });
await once(server, 'listening');
const wasmRequested = Promise.withResolvers();
const releaseWasm = Promise.withResolvers();
let browser;

const frame = (index) => ({
  payload_id: '0x01', index,
  base: { block_number: '33001', timestamp: String(Math.floor(Date.now() / 1000)) },
  diff: { transactions: [] }, metadata: { receipts: {} },
});

try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }), args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const dropped = Promise.withResolvers();
  page.on('console', message => {
    if (message.text().includes('waiting for block start')) dropped.resolve();
  });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.abort();
    if (url.pathname.endsWith('.wasm')) {
      wasmRequested.resolve();
      await releaseWasm.promise;
    }
    return route.continue();
  });
  await page.addInitScript(() => {
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = new Proxy(OriginalWebSocket, {
      construct(target, args, newTarget) {
        const url = new URL(String(args[0]));
        if (url.hostname !== 'mainnet.flashblocks.base.org') throw new Error(`Unexpected WebSocket: ${url.hostname}`);
        args[0] = 'ws://127.0.0.1:45739/mainnet';
        return Reflect.construct(target, args, newTarget);
      },
    });
  });
  const connection = once(server, 'connection', { signal: AbortSignal.timeout(10000) });
  const response = await page.goto('http://127.0.0.1:45738/', { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200);
  const [socket] = await connection;

  socket.send(brotliCompressSync(Buffer.from(JSON.stringify(frame(0)))));
  await Promise.race([
    wasmRequested.promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('WASM was not requested')), 10000)),
  ]);
  socket.send(JSON.stringify(frame(2)));
  // Keep the decoder response blocked long enough for an unordered handler to
  // consume and discard the later text frame; the fixed handler queues it.
  await Promise.race([dropped.promise, new Promise(resolve => setTimeout(resolve, 1000))]);
  releaseWasm.resolve();
  await page.getByText('Block 33001#1', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByText('Block 33001#2', { exact: true }).waitFor({ timeout: 10000 });
  console.log('PASS: a later text frame cannot overtake a delayed compressed first frame');
} catch (error) {
  console.error('Ordering smoke failed:', error);
  process.exitCode = 1;
} finally {
  releaseWasm.resolve();
  if (browser) await browser.close();
  for (const client of server.clients) client.terminate();
  await new Promise(resolve => server.close(resolve));
}
