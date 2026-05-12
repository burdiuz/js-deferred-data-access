---
name: "deferred-data-access"
description: "TypeScript library that wraps objects in an ES Proxy and converts every property access, assignment, deletion, and call into a typed command delivered to a developer-supplied async handler. Use when working on or extending this package; building handlers that depend on it (REST object, worker proxy, etc.); reading or writing command chains; setting up cross-context communication via initialize(); working with ResourcePool and Resource; or writing and debugging tests for DDA-based code."
license: "MIT"
compatibility: "Node.js 18+. TypeScript 5+. Tests use Jest 30 + ts-jest. Run `npm test` from packages/deferred-data-access."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "2.0.0"
  package: "@actualwave/deferred-data-access"
---

# Deferred Data Access — Agent Skill

## Sub-packages

| Import path | Key exports |
|---|---|
| `@actualwave/deferred-data-access` | `handle` |
| `.../command` | `Command`, `CommandChain`, `createCommandHandler` |
| `.../proxy` | `ProxyCommand`, `wrapWithProxy`, `isWrappedWithProxy`, `unwrapProxy`, `generateProxyCommand` |
| `.../resource` | `Resource`, `ResourcePool`, `ResourcePoolRegistry`, `getDefaultResourcePool`, `isResourceObject`, `createResource` |
| `.../record` | `recordHandlerCalls`, `latestCall`, `latestCallFor`, `clearLatestCalls` |
| `.../utils` | `IdOwner`, `generateId`, `createUIDGenerator`, `isReservedPropertyName`, `ReservedPropertyNames`, `reject` |
| `.../interface` | `initialize`, `InterfaceType`, `MessageType`, `createSubscriberFns`, `findEventEmitter`, `findMessagePort` |

## Core workflow

```
handle(handler, lazy?) → wrap(target) → Proxy
  → property access / call / set
  → CommandChain (head → prev → … → tail)
  → .then() / await → handler(command, context, wrap)
  → Promise<result>
```

## Command types (`ProxyCommand`)

| Constant | Triggered by |
|---|---|
| `GET` `'P:get'` | `proxy.prop` |
| `SET` `'P:set'` | `proxy.prop = v` |
| `DELETE_PROPERTY` `'P:del'` | `delete proxy.prop` |
| `APPLY` `'P:apply'` | `proxy(args)` |
| `METHOD_CALL` `'P:call'` | `proxy.method(args)` *(lazy only)* |

## Lazy vs reactive

- **Lazy** (default): handler fires once on `await`. Consecutive GET + APPLY collapses to `METHOD_CALL`. Walk `command.prev` for the full chain.
- **Reactive** (`handle(h, false)`): fires on every operation. `METHOD_CALL` never emitted; `APPLY` has no `name` — derive it from the preceding GET's path segment.

## CommandChain

```typescript
command.forEach(n => path.push(String(n.name))); // deepest-first
const nodes = [...command];    // head … tail via Symbol.iterator
command.withoutPrev();          // immutable copy, prev severed — never mutate prev directly
```

## `initialize()` (cross-context)

```typescript
import { initialize, InterfaceType } from '@actualwave/deferred-data-access/interface';
const { root, stop } = await initialize({
  type: InterfaceType.HOST,      // or GUEST
  root: myApi,
  subscribe:   fn => emitter.on('message', fn),
  unsubscribe: fn => emitter.off('message', fn),
  sendMessage: data => transport.send(data),
  preprocessResponse: e => e.data,
  handshakeTimeout: 5_000,
});
```

## Testing

```bash
cd packages/deferred-data-access && npm test
```

Jest 30, ts-jest. `moduleNameMapper` in `jest.config.js` + `paths` in `tsconfig.spec.json`.

## Key invariants

- `typeof null === 'object'` — always guard `value != null && typeof value === 'object'`.
- DDA always wraps root context in `Promise.resolve()`. Avoid unconditional `await`; check `isPromiseLike` first.
- `APPLY` in reactive mode has no `name` — derive from preceding GET's path.
- `Command.type`, `Command.name`, `Resource.pool`, `IdOwner.id` are runtime non-writable.
- `isReservedPropertyName('then')` → `true`; symbol keys always → `false`.
