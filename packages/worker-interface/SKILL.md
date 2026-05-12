---
name: "worker-interface"
description: "Bidirectional DDA RPC between the main thread (HOST) and a Web Worker (GUEST). Use when offloading CPU-heavy work to a Worker with a typed async API, initialising both sides of a Worker channel, or spinning up a Worker from a URL string."
license: "MIT"
compatibility: "Browser and Node.js 18+ (worker_threads). TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/worker-interface"
---

# @actualwave/worker-interface

Wraps `Worker.postMessage` / `self.postMessage` in DDA's `initialize()`. Main thread is **HOST**; worker is **GUEST**.

## Key exports

```typescript
import { initializeHost, initializeWorker } from '@actualwave/worker-interface';
```

## Pattern

```typescript
// Main thread
const { root: workerApi, stop } = await initializeHost({
  worker: new Worker('./worker.js'), // or a URL string
  root: { getConfig: () => config },
});
const result = await workerApi.processData(input);

// Worker (worker.js)
const { root: mainApi, stop } = await initializeWorker({
  root: {
    processData: async (input) => heavyCompute(input),
  },
});
const config = await mainApi.getConfig();
```

## `initializeHost(config)`

| Field | Description |
|---|---|
| `worker` | `Worker` instance or URL string (auto-creates `new Worker(url)`) |
| `root?` | API to expose to the worker |
| `handshakeTimeout?` | ms |
| `responseTimeout?` | ms |

`findEventEmitter` and `findMessagePort` from `.../interface` detect the right emitter/port on the worker automatically.

## `initializeWorker(config)`

Same as host config minus `worker`. Uses `self` as the message port.

## Key invariants

- `initializeHost` with a string URL creates a new `Worker` — `typeof Worker === 'undefined'` check throws if `Worker` is not globally available.
- Both functions call `createSubscriberFns(emitter)` to derive `subscribe`/`unsubscribe` from the worker's event emitter.
- `sendMessage` calls `(worker/self).postMessage(data)` — structured-clone algorithm; non-cloneable values throw.
