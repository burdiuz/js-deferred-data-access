# js-deferred-data-access

A monorepo of TypeScript libraries built around **Deferred Data Access (DDA)** — a pattern that wraps any object in an ES `Proxy` and converts every property access, assignment, deletion, and method call into a typed command delivered to a developer-supplied async handler.

## How it works

```typescript
import { handle } from '@actualwave/deferred-data-access';

const wrap = handle(async (command, context) => {
  const target = await context;
  if (command.type === 'P:get') return target[command.name];
  if (command.type === 'P:call') return target[command.name](...command.value);
});

const proxy = wrap({ user: { name: 'Alice' } });
const name = await proxy.user.name; // → 'Alice'
```

The handler receives a `CommandChain` — a linked list of operations that led to the `await`. The same mechanism powers every package in this repo.

---

## Packages

### Core

#### [`@actualwave/deferred-data-access`](packages/deferred-data-access)
The foundation. Wraps objects in a `Proxy` that turns every access into a `Command`. Includes sub-packages for commands, proxy traps, resource pooling, cross-context interfaces, and utilities.

---

### Data & HTTP

#### [`@actualwave/rest-object`](packages/rest-object)
Turns dot-notation property access into REST API calls. `api.users[42].read()` becomes `GET /users/42` — no manual URL construction.

#### [`@actualwave/idb-proxy`](packages/idb-proxy)
Translates dot-notation access chains into IndexedDB operations. `db.todos.get(1)` runs the IDB transaction — no boilerplate `openRequest` / `onsuccess` chains.

#### [`@actualwave/query-builder`](packages/query-builder)
Captures an entire proxy access chain as a serialisable `QueryDescriptor` before sending a single batched request — GraphQL-style lazy query building over DDA.

---

### Security

#### [`@actualwave/proxy-guard`](packages/proxy-guard)
A permission and policy layer that intercepts every DDA command and evaluates it against a configurable rule set before execution. Use for RBAC, audit logging, or sandboxing.

---

### Cross-Context Communication

All interface packages wrap DDA's `initialize()` — a bidirectional handshake that exposes a typed async API from one context to another over any transport.

#### [`@actualwave/worker-interface`](packages/worker-interface)
Main thread ↔ Web Worker (or Node.js `worker_threads`). Offload CPU-heavy work and call it like a local async function.

#### [`@actualwave/websocket-interface`](packages/websocket-interface)
Browser client ↔ Node.js WebSocket server. Bidirectional RPC with automatic JSON serialisation.

#### [`@actualwave/broadcast-interface`](packages/broadcast-interface)
Cross-tab / cross-window RPC via the `BroadcastChannel` API. Share a live API between browser tabs with no server needed.

#### [`@actualwave/iframe-interface`](packages/iframe-interface)
Bidirectional RPC between a parent page and an embedded iframe over `postMessage`.

#### [`@actualwave/mfe-interface`](packages/mfe-interface)
Shell ↔ microfrontend communication via DOM `CustomEvent`s on a shared element. No shared runtime required.

#### [`@actualwave/serviceworker-interface`](packages/serviceworker-interface)
Bidirectional RPC between a page and its Service Worker. One DDA session per client tab, identified automatically.

#### [`@actualwave/webrtc-interface`](packages/webrtc-interface)
Peer-to-peer RPC over an `RTCDataChannel`. Call remote browser APIs directly across a P2P connection.

#### [`@actualwave/webview-interface`](packages/webview-interface)
Bidirectional RPC between a React Native host and a WebView over the asymmetric `injectJavaScript` / `ReactNativeWebView.postMessage` transport.

---

## Development

```bash
npm install        # install all dependencies
npm run build      # build all packages → dist/
npm test           # run all test suites
npm run serve      # serve interactive examples at http://localhost:5000
```

All packages build into `dist/<package-name>/`. Each artifact includes the UMD bundle, CJS bundle, TypeScript declarations, `README.md`, `SKILL.md`, `package.json`, and `LICENSE`.

## License

MIT — see [LICENSE](LICENSE).
