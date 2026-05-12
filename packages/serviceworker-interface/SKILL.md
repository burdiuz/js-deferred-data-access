---
name: "serviceworker-interface"
description: "Bidirectional DDA RPC between a browser page (GUEST) and its Service Worker (HOST). Use when exposing SW cache/push APIs to a page, calling page methods from the SW, or managing per-tab DDA sessions in the service worker."
license: "MIT"
compatibility: "Browser with Service Worker support. Requires HTTPS or localhost. TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/serviceworker-interface"
---

# @actualwave/serviceworker-interface

Page is **GUEST** (initiates handshake); SW is **HOST** (waits). One DDA session per tab, identified by `event.source.id`.

## Key exports

```typescript
import { createPageInterface } from '@actualwave/serviceworker-interface'; // page
import { createWorkerInterface } from '@actualwave/serviceworker-interface'; // SW
```

## Page side (GUEST)

```typescript
await navigator.serviceWorker.register('/sw.js');
await navigator.serviceWorker.ready;

const { root: swApi, stop } = await createPageInterface({
  root: { notifyUser: (msg) => toast(msg) },
  handshakeTimeout: 5_000,
});
const stats = await swApi.getCacheStats();
```

## SW side (HOST)

```typescript
// sw.js
const server = createWorkerInterface({
  root: { getCacheStats: async () => ({ count: … }) },
  onConnect({ clientId, root: pageApi, stop }) {
    pageApi.notifyUser('SW ready!');
  },
});
self.addEventListener('activate', () => server.stop());
```

## Config types

**`PageConfig`** — `BaseInitConfig` minus transport callbacks (`root?`, `handshakeTimeout?`, `responseTimeout?`, `id?`).

**`WorkerConfig`** — same as `PageConfig` plus `onConnect({ clientId, root, stop })`.

**`WorkerInterfaceServer`** — `{ stop() }` returned by `createWorkerInterface`.

## Key invariants

- `createWorkerInterface` adds one global `'message'` listener to `self`. Call `server.stop()` to remove it and dispose all sessions.
- Sessions are created lazily on the first message from each client. The triggering message is re-dispatched so the handshake listener receives it.
- Page must have an active controller before calling `createPageInterface` — always await `navigator.serviceWorker.ready`.
- Transport: page sends via `navigator.serviceWorker.controller.postMessage`; SW sends via `client.postMessage` per session.
