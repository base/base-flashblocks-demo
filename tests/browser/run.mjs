import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

const preview = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '45738'], { stdio: 'inherit' });
let exited = false;
preview.once('exit', () => { exited = true; });
try {
  let ready = false;
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline && !exited) {
    try {
      const response = await fetch('http://127.0.0.1:45738/', { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { /* server is not ready yet */ }
    await delay(250);
  }
  if (!ready) throw new Error('Production preview did not become ready; run pnpm build first and ensure port 45738 is free.');
  for (const test of ['browser-smoke', 'ordering-smoke', 'decoder-retry-smoke', 'decoder-stall-smoke', 'lost-frame-smoke']) {
    const child = spawn(process.execPath, [`tests/browser/${test}.mjs`], { stdio: 'inherit' });
    const [code, signal] = await once(child, 'exit');
    if (code !== 0) throw new Error(`${test} failed (${signal ?? code})`);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (!exited) {
    preview.kill('SIGTERM');
    await once(preview, 'exit');
  }
}
