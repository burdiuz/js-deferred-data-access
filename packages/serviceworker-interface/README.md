# @actualwave/serviceworker-interface

Bidirectional DDA RPC between a browser page and its Service Worker. The page is the GUEST (initiates handshake); the SW is the HOST (waits). Each tab gets its own isolated DDA session.

## Installation

```bash
npm install @actualwave/serviceworker-interface
```

## Usage

### Page (GUEST)

```typescript
import { createPageInterface } from '@actualwave/serviceworker-interface';

await navigator.serviceWorker.register('/sw.js');
await navigator.serviceWorker.ready;

const { root: swApi, stop } = await createPageInterface({
  root: {
    notifyUser(msg: string) { showToast(msg); },
  },
  handshakeTimeout: 5_000,
});

const stats = await swApi.getCacheStats();
console.log('Cached entries:', stats.count);

await swApi.clearExpiredCache();
```

### Service Worker (HOST)

```typescript
// sw.js
import { createWorkerInterface } from '@actualwave/serviceworker-interface';

const server = createWorkerInterface({
  root: {
    getCacheStats: async () => ({ count: await caches.keys().then(k => k.length) }),
    clearExpiredCache: async () => { /* … */ },
  },
  handshakeTimeout: 5_000,
  onConnect({ clientId, root: pageApi, stop }) {
    console.log('Client connected:', clientId);
    pageApi.notifyUser('Service Worker ready!');
  },
});

self.addEventListener('activate', () => server.stop());
```

## API

### `createPageInterface(config)` → `Promise<InitializeResult>`

Wires `navigator.serviceWorker` messaging and calls `initialize()` as `GUEST`.

| Option | Type | Description |
|---|---|---|
| `root` | `unknown` | API to expose to the SW |
| `handshakeTimeout` | `number` | ms before handshake times out |
| `responseTimeout` | `number` | ms before a remote call times out |

### `createWorkerInterface(config)` → `WorkerInterfaceServer`

Sets up a global `message` listener in the SW context. Creates a new per-client DDA session on the first message from each tab.

| Option | Type | Description |
|---|---|---|
| `root` | `unknown` | API to expose to every page |
| `onConnect` | `(connection) => void` | Called when a new client handshakes. `connection.root` is a proxy to that tab's page API. |
| `handshakeTimeout` | `number` | ms before handshake times out per client |
| `responseTimeout` | `number` | ms before a remote call times out |

`WorkerInterfaceServer.stop()` removes the global listener and disposes all sessions.

## Notes

- Sessions are identified by `event.source.id` (the FetchEvent client ID). Each tab gets an independent DDA channel.
- The page must have an active SW controller before calling `createPageInterface` — await `navigator.serviceWorker.ready`.
- Requires HTTPS or `localhost`.
