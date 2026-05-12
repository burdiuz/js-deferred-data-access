---
name: deferred-data-access
description: TypeScript library that wraps objects in an ES Proxy and converts every property access, assignment, deletion, and call into a typed command delivered to a developer-supplied async handler. Use when working on or extending this package; building handlers that depend on it (REST object, worker proxy, etc.); reading or writing command chains; setting up cross-context communication via initialize(); working with ResourcePool and Resource; or writing and debugging tests for DDA-based code.
license: MIT
compatibility: Node.js 18+. TypeScript 5+. Tests use Jest 30 + ts-jest. Run `npm test` from the package root (packages/deferred-data-access).
metadata:
  author: Oleg Galaburda
  version: "2.0.0"
  package: "@actualwave/deferred-data-access"
---

# Deferred Data Access — Agent Skill

## Architecture overview

The library is split into focused sub-packages. Each is imported independently:

| Sub-package path | Key exports |
|---|---|
| `@actualwave/deferred-data-access` | `handle` |
| `.../command` | `Command`, `CommandChain`, `createCommandHandler` |
| `.../proxy` | `ProxyCommand`, `wrapWithProxy`, `isWrappedWithProxy`, `unwrapProxy`, `generateProxyCommand` |
| `.../resource` | `Resource`, `ResourcePool`, `ResourcePoolRegistry`, `getDefaultResourcePool`, `isResourceObject`, `createResource` |
| `.../record` | `recordHandlerCalls`, `latestCall`, `latestCallFor`, `clearLatestCalls` |
| `.../utils` | `IdOwner`, `generateId`, `createUIDGenerator`, `isReservedPropertyName`, `ReservedPropertyNames`, `reject` |
| `.../interface` | `initialize`, `InterfaceType`, `MessageType`, `createSubscriberFns`, `findEventEmitter`, `findMessagePort` |

Source lives at `packages/deferred-data-access/`. Each sub-package has its own `index.ts`.

---

## Core workflow

```
handle(handler, lazy?) → wrap(target) → Proxy
                                          ↓
                              property access / call / set
                                          ↓
                              CommandChain built (head → prev → … → tail)
                                          ↓
                              .then() / await triggers handler(command, context, wrap)
                                          ↓
                              handler returns Promise<result>
```

```typescript
import { handle } from '@actualwave/deferred-data-access';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';

const wrap = handle(async (command, context, wrap) => {
  const target = await context;
  if (command.type === ProxyCommand.GET) return target[command.name];
  if (command.type === ProxyCommand.METHOD_CALL)
    return target[command.name](...(command.value as unknown[]));
});

const proxy = wrap({ user: { name: 'Alice' } });
const name = await proxy.user.name; // → 'Alice'
```

---

## Command types

All values live on `ProxyCommand` (enum from `.../proxy`):

| Constant | Value | Triggered by |
|---|---|---|
| `GET` | `'P:get'` | `proxy.prop` |
| `SET` | `'P:set'` | `proxy.prop = value` |
| `DELETE_PROPERTY` | `'P:del'` | `delete proxy.prop` |
| `APPLY` | `'P:apply'` | `proxy(args)` |
| `METHOD_CALL` | `'P:call'` | `proxy.method(args)` *(lazy only — collapses GET + APPLY)* |

Command fields:

```typescript
interface ICommand {
  type: string;              // ProxyCommand value
  name?: string | symbol;    // property name for GET / SET / DELETE / METHOD_CALL
  value?: unknown;           // new value (SET), args array (APPLY / METHOD_CALL)
  context?: Promise<unknown>;// Promise resolving to the target object
}
```

---

## Lazy vs reactive mode

`handle(handler, lazy = true)`

- **Lazy (default)**: handler called **once** when `.then()` / `await` is reached. Intermediate GETs chain up without invoking the handler. The delivered command is the **head**; walk `command.prev` for earlier steps.
- **Reactive (`false`)**: handler called on **every** operation.

In lazy mode, consecutive `GET` + `APPLY` collapses into a single `METHOD_CALL` command.

---

## Reading a CommandChain

`command` passed to the handler is the head of a linked list. Tail has no `prev`.

```typescript
// Reconstruct the property path (head → tail = deepest → shallowest)
const path: string[] = [];
command.forEach(node => path.push(String(node.name)));
// path is deepest-first: ['prop', 'child', 'root']

// Equivalent using spread (Symbol.iterator)
const nodes = [...command]; // [head, ..., tail]

// Functional helpers
command.map(node => node.type);
command.reduce((acc, node) => ({ ...acc, [node.type]: node.name }), {});
command.isTail(); // true if this node has no prev
```

### withoutPrev()

Creates an immutable copy of a node with the `prev` link removed. **Never mutate `prev` directly.**

```typescript
const severed = command.withoutPrev();
// severed.prev === undefined; original command.prev is untouched
```

---

## Dispatcher utility

`createCommandHandler` routes by type, avoiding a manual switch:

```typescript
import { createCommandHandler } from '@actualwave/deferred-data-access/command';

const handler = createCommandHandler({
  handlers: {
    [ProxyCommand.GET]:    async (cmd, ctx) => (await ctx)[cmd.name],
    [ProxyCommand.SET]:    async (cmd, ctx) => { (await ctx)[cmd.name] = cmd.value; },
    [ProxyCommand.METHOD_CALL]: async (cmd, ctx) =>
      (await ctx)[cmd.name](...(cmd.value as unknown[])),
  },
  defaultHandler: async (cmd) => { throw new Error(`Unhandled: ${cmd.type}`); },
});
```

---

## Resource system

Objects that cross serialisation boundaries (e.g. `postMessage`) are tracked by ID in a `ResourcePool`.

```typescript
import { getDefaultResourcePool, isResourceObject } from '@actualwave/deferred-data-access/resource';

const pool = getDefaultResourcePool(); // module-level singleton

// Register and serialise
const resource = pool.set(myObject)!;
const descriptor = resource.toObject(); // { id, poolId, type }

// Reconstruct on receiving side
const original = pool.getById(descriptor.id);

// Type guard before lookup
if (isResourceObject(value)) {
  const live = pool.getById(value.id);
}
```

`isResourceObject(value)` returns `false` for `null`, non-objects, and objects missing `id`/`poolId` strings.

---

## Cross-context interface

`initialize()` sets up bidirectional proxying between two contexts. One side is `HOST` (waits), the other is `GUEST` (initiates).

```typescript
import { initialize, InterfaceType } from '@actualwave/deferred-data-access/interface';

// HOST side (e.g. main thread)
const { root, stop } = await initialize({
  type: InterfaceType.HOST,
  root: myApi,                              // object to expose to guest
  subscribe:   fn => worker.addEventListener('message', fn),
  unsubscribe: fn => worker.removeEventListener('message', fn),
  sendMessage: data => worker.postMessage(data),
  handshakeTimeout: 5000,
  responseTimeout: 10000,
});
// root is a proxy to the guest's exported API

// GUEST side (e.g. Worker)
await initialize({
  type: InterfaceType.GUEST,
  root: guestApi,
  subscribe:   fn => self.addEventListener('message', fn),
  unsubscribe: fn => self.removeEventListener('message', fn),
  sendMessage: data => self.postMessage(data),
  handshakeTimeout: 5000,
});
```

`initialize()` resolves once handshake completes. If no `root` on the remote side, `root` is `null`.

---

## Testing

Run from the package root:

```bash
cd packages/deferred-data-access
npm test           # all suites
npm run test:coverage
```

Stack: Jest 30, ts-jest 29 (compatible with Jest 30), TypeScript 6.  
Config: `jest.config.js` (standalone, no Nx preset).  
Path aliases are resolved via `tsconfig.spec.json` — `@actualwave/deferred-data-access/*` maps to local `index.ts` files.

Write specs as `*.spec.ts` next to the source file. The test runner discovers them automatically.

---

## Key invariants and pitfalls

**Null/object checks** — `typeof null === 'object'`. Always guard:
```typescript
// Wrong
if (typeof value === 'object') { ... }
// Right
if (value != null && typeof value === 'object') { ... }
```

**Promise cleanup** — use `.then(onFulfilled, onRejected)`, not `.catch(noop).then(onFulfilled)`:
```typescript
// Wrong — creates an extra microtask, swallows rejection before then()
promise.catch(noop).then(() => cleanup());
// Right
promise.then(() => cleanup(), noop);
```

**latestCallFor timing** — the per-context entry is deleted when the call resolves. Check it *while the call is in-flight*, not after `await`:
```typescript
const callPromise = wrapped(command, ctx, wrap);
const stored = latestCallFor(ctx); // ✓ in-flight
expect(stored).toBeInstanceOf(Promise);
await callPromise;
```

**isReservedPropertyName and symbols** — deliberately returns `false` for symbol names; only `'then'` and `'catch'` strings are reserved:
```typescript
isReservedPropertyName(Symbol('then')) // → false (intentional)
isReservedPropertyName('then')         // → true
```

**toJSON array length** — `Command.toJSON()` emits a 3-element array `[type, name, value]` without context. `JSON.stringify` coerces `undefined` to `null`, so the 4th element is omitted entirely. `fromJSON` handles both 3- and 4-element arrays.

**Runtime readonly** — `Command.type`, `Command.name`, `Resource.pool`, `Resource.type`, and `IdOwner.id` are enforced non-writable at runtime via `Object.defineProperty`. Assigning to them throws in strict mode. Use `withoutPrev()` to derive a modified `CommandChain` node rather than mutating `prev`.

**Lazy root access to `then`/`catch`** — accessing `then` or `catch` on a lazy proxy that has no prior chain (root level) uses the raw context directly. This is the correct fallback; it does not throw.
