## Getting started

Use the Node.js version pinned in `.nvmrc` (for example, run `nvm install` and `nvm use`).

This historical demo consumes the raw Flashblocks infrastructure stream, not a standard JSON-RPC WebSocket subscription. The stream is intended for node operators; see the [infrastructure stream documentation](https://docs.base.org/base-chain/api-reference/flashblocks-api/flashblocks-api-overview).

Flashblocks ended on Base Sepolia when Denim activated on October 21, 2026. Mainnet Denim activation was targeted for November 5, 2026; Flashblocks end after activation. See the [migration guide](https://docs.base.org/upgrades/denim/migrate-from-flashblocks) for the current status and replacement APIs. The local fixture checks in this change do not verify live stream availability.

To run the demo with compatible streams, create `.env.local` with the endpoints, replacing the placeholders:

```dotenv
NEXT_PUBLIC_MAINNET_WEBSOCKET_URL=wss://<mainnet-flashblocks-endpoint>
NEXT_PUBLIC_SEPOLIA_WEBSOCKET_URL=wss://<sepolia-flashblocks-endpoint>
```

`NEXT_PUBLIC_` values are included in the browser bundle, so do not put secrets in them.
The demo requires the legacy stream's message format, including receipt metadata; newer stream formats may not be compatible.

With pnpm installed, install dependencies and start the development server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Browser regression tests

With Google Chrome installed (or `CHROME_PATH` set to a compatible Chromium executable), build with fixture URLs and run the tests:

```bash
NEXT_PUBLIC_MAINNET_WEBSOCKET_URL=wss://mainnet.flashblocks.base.org/ws \
NEXT_PUBLIC_SEPOLIA_WEBSOCKET_URL=wss://sepolia.flashblocks.base.org/ws pnpm build
pnpm test
```

The tests start a local production preview on port 45738 and WebSocket fixtures on port 45739. They redirect WebSockets and block external HTTP requests, and do not use public RPCs or send transactions. Stop any processes already using those ports before running them.
