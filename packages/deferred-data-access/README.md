# Deferred Data Access

Deferred Data Access (DDA) is a TypeScript library that wraps any object or Promise in a `Proxy` and records every property access, assignment, deletion, and function call as a typed **command**. A developer-supplied handler function decides what each command means — fetching from a REST API, forwarding to a Web Worker, replaying in a test, or anything else.

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [How it works](#how-it-works)
- [Lazy vs reactive mode](#lazy-vs-reactive-mode)
- [Command types](#command-types)
- [Command handler](#command-handler)
- [createCommandHandler](#createcommandhandler)
- [CommandChain API](#commandchain-api)
- [Resource system](#resource-system)
- [Cross-context interface](#cross-context-interface)
- [Sub-package reference](#sub-package-reference)
- [Projects built on DDA](#projects-built-on-dda)

---

## Installation

```bash
npm install @actualwave/deferred-data-access
```

---

## Quick start

```typescript
import { handle } from '@actualwave/deferred-data-access';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';

// 1. Define a handler that interprets commands
const handler = async (command, context, wrap) => {
  if (command.type === ProxyCommand.GET) {
    const target = await context;
    return target[command.name];
  }
  // ...
};

// 2. Create a wrap factory for a given handler
const wrap = handle(handler);

// 3. Wrap an object (or a Promise of one) — returns a Proxy
const proxy = wrap({ user: { name: 'Alice' } });

// 4. Access properties — in lazy mode handler is called once on .then()
const name = await proxy.user.name; // → 'Alice'
```

---

## How it works

1. `handle(handler)` returns a `wrap` factory.
2. `wrap(target)` wraps `target` in a `Proxy`. Every property access, assignment, deletion, or call is intercepted.
3. Intercepted operations are chained into a `CommandChain` — a linked list of `ICommand` nodes, head to tail.
4. When the result is awaited (`.then()` / `await`), the handler receives the full chain plus a context Promise and must return a Promise with the resolved value.
5. The handler can call `wrap(result, command)` to return a new proxy that continues the same chain, enabling deeply nested lazy access.

---

## Lazy vs reactive mode

`handle(handler, lazy?)` — second argument controls the mode (default: `true`).

### Lazy mode (default)

The handler is called **once** per `.then()` / `.catch()` invocation. Intermediate GET/APPLY operations build up a `CommandChain` but do not invoke the handler until the result is awaited.

```typescript
const wrap = handle(handler); // lazy = true

const proxy = wrap(rootObject);
proxy.a.b.c; // no handler calls yet
await proxy.a.b.c; // handler called once with chain: GET(c) → GET(b) → GET(a)
```

The command delivered to the handler is the **head** of the chain. Walk `command.prev` to reach earlier operations.

### Reactive mode

The handler is called on **every** intercepted operation.

```typescript
const wrap = handle(handler, false); // lazy = false

const proxy = wrap(rootObject);
proxy.a; // handler called: GET('a')
proxy.a.b; // handler called: GET('a'), then GET('b') on its result
```

---

## Command types

Imported from `@actualwave/deferred-data-access/proxy`:

| Constant | Value | Triggered by |
|---|---|---|
| `ProxyCommand.GET` | `'P:get'` | `proxy.prop` |
| `ProxyCommand.SET` | `'P:set'` | `proxy.prop = value` |
| `ProxyCommand.DELETE_PROPERTY` | `'P:del'` | `delete proxy.prop` |
| `ProxyCommand.APPLY` | `'P:apply'` | `proxy(args)` |
| `ProxyCommand.METHOD_CALL` | `'P:call'` | `proxy.method(args)` *(lazy mode only — collapses GET + APPLY)* |

`METHOD_CALL` is only generated in lazy mode when a `GET` is immediately followed by an `APPLY`. It carries the method name in `command.name` and the arguments in `command.value`.

### Command shape

```typescript
interface ICommand {
  type: string;          // ProxyCommand value
  name?: PropertyName;   // string | symbol — property name
  value?: unknown;       // SET value, APPLY args, or METHOD_CALL args
  context?: Promise<unknown>; // Promise resolving to the target object
}
```

---

## Command handler

```typescript
type CommandHandler = (
  command: ICommandList,
  context: CommandContext | undefined,
  wrap: (context: CommandContext, command?: ICommandChain) => unknown
) => Promise<unknown>;
```

| Argument | Description |
|---|---|
| `command` | Head of the `CommandChain` — inspect `command.type`, `command.name`, `command.value`. Walk `command.prev` for earlier operations. |
| `context` | A `Promise` resolving to the target object the command was issued against. `undefined` for the root call. |
| `wrap` | Re-wraps a new Promise with the same handler, enabling chained lazy access on sub-objects. |

### Example — object property access

```typescript
const handler = async (command, context, wrap) => {
  const target = await context;

  switch (command.type) {
    case ProxyCommand.GET:
      return target[command.name];

    case ProxyCommand.SET:
      target[command.name] = command.value;
      return;

    case ProxyCommand.METHOD_CALL:
      return target[command.name](...command.value);

    case ProxyCommand.APPLY:
      return (target as Function)(...command.value);

    case ProxyCommand.DELETE_PROPERTY:
      return delete target[command.name];
  }
};
```

---

## createCommandHandler

A utility that dispatches to per-type handler functions:

```typescript
import { createCommandHandler } from '@actualwave/deferred-data-access/command';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';

const handler = createCommandHandler({
  handlers: {
    [ProxyCommand.GET]: async (command, context) => {
      const target = await context;
      return target[command.name];
    },
    [ProxyCommand.SET]: async (command, context) => {
      const target = await context;
      target[command.name] = command.value;
    },
  },
  defaultHandler: async (command) => {
    throw new Error(`Unhandled command: ${command.type}`);
  },
});

const wrap = handle(handler, false);
```

If no matching handler and no `defaultHandler`, the call resolves to `undefined`.

---

## CommandChain API

`CommandChain` extends `Command` and is iterable from head to tail:

```typescript
import { CommandChain } from '@actualwave/deferred-data-access/command';

// Iterate head → tail
for (const node of command) {
  console.log(node.type, node.name);
}

// Functional traversal
const types = command.map(node => node.type);
const path  = command.reduce((acc, node) => [node.name, ...acc], []);

command.forEach(node => { /* head → tail */ });
command.isTail(); // true if this node has no prev
```

### withoutPrev()

Creates an immutable copy of the node with the `prev` link removed. Use this instead of mutating `prev` directly to avoid corrupting shared chain references:

```typescript
const severed = command.withoutPrev();
// severed.prev === undefined
// command.prev is unchanged
```

---

## Resource system

Resources allow objects to be referenced by ID across serialisation boundaries (e.g. `postMessage`). Each `Resource` gets a stable string ID and lives in a `ResourcePool`.

```typescript
import {
  ResourcePool,
  getDefaultResourcePool,
  isResourceObject,
} from '@actualwave/deferred-data-access/resource';

const pool = getDefaultResourcePool(); // module-level singleton

// Register an object
const resource = pool.set(myObject);
console.log(resource.id);     // stable string ID
console.log(resource.poolId); // pool's own ID

// Serialise for postMessage
const descriptor = resource.toObject();
// { id: '...', poolId: '...', type: 'object' }

// Reconstruct on the other side
const retrieved = pool.getById(descriptor.id);

// Type guard
if (isResourceObject(value)) {
  const live = pool.getById(value.id);
}
```

Multiple pools can be managed through `ResourcePoolRegistry`:

```typescript
import { ResourcePoolRegistry } from '@actualwave/deferred-data-access/resource';

const registry = new ResourcePoolRegistry(); // auto-registers the default pool
const pool = registry.createPool();
registry.get(pool.id); // → pool
```

---

## Cross-context interface

`initialize()` sets up a **bidirectional proxy channel** between two contexts (main thread ↔ Worker, two iframes, WebSocket peers, etc.). Each side runs `initialize()` and they perform a handshake before exposing proxies to each other's `root` object.

```typescript
import { initialize, InterfaceType } from '@actualwave/deferred-data-access/interface';

// --- Main thread (HOST) ---
const worker = new Worker('./worker.js');

const { root, stop } = await initialize({
  type: InterfaceType.HOST,
  root: { greet: (name: string) => `Hello, ${name}!` }, // expose to worker
  subscribe:   (fn) => worker.addEventListener('message', fn),
  unsubscribe: (fn) => worker.removeEventListener('message', fn),
  sendMessage: (data) => worker.postMessage(data),
  handshakeTimeout: 5000,
  responseTimeout: 10000,
});

// `root` is a proxy to the worker's exported API
const result = await root.remoteMethod('arg');
stop(); // detach message listener
```

```typescript
// --- Worker (GUEST) ---
import { initialize, InterfaceType } from '@actualwave/deferred-data-access/interface';

await initialize({
  type: InterfaceType.GUEST,
  root: { remoteMethod: (arg: string) => arg.toUpperCase() },
  subscribe:   (fn) => self.addEventListener('message', fn),
  unsubscribe: (fn) => self.removeEventListener('message', fn),
  sendMessage: (data) => self.postMessage(data),
  handshakeTimeout: 5000,
  responseTimeout: 10000,
});
```

### InitConfig options

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | `InterfaceType` | required | `HOST` waits for the guest; `GUEST` initiates |
| `root` | `unknown` | — | Object to expose to the remote side |
| `subscribe` | `(fn) => void` | required | Attach a message listener |
| `unsubscribe` | `(fn) => void` | required | Detach a message listener |
| `sendMessage` | `(data) => void` | required | Send a message to the remote side |
| `id` | `string` | auto | Stable ID for this interface endpoint |
| `remoteId` | `string` | — | Expected remote ID (skips handshake if both sides know each other's ID) |
| `handshakeTimeout` | `number` | — | ms before handshake times out |
| `handshakeInterval` | `number` | — | ms between handshake retry attempts (GUEST only) |
| `responseTimeout` | `number` | `0` (none) | ms before a remote call times out |
| `preprocessResponse` | `(data) => unknown` | identity | Transform raw message data before parsing |

### initialize() return value

```typescript
{
  stop: () => void;           // detach the message listener
  pool: ResourcePool;         // local resource pool
  root: unknown | null;       // proxy to the remote root (null if remote has no root)
  wrap: Function;             // wrap factory with the same handler (for advanced use)
  pendingRequests: Map<…>;    // in-flight request map (for advanced use)
}
```

---

## Sub-package reference

| Import path | Key exports |
|---|---|
| `@actualwave/deferred-data-access` | `handle` |
| `@actualwave/deferred-data-access/command` | `Command`, `CommandChain`, `createCommandHandler` |
| `@actualwave/deferred-data-access/proxy` | `ProxyCommand`, `wrapWithProxy`, `isWrappedWithProxy`, `unwrapProxy`, `generateProxyCommand` |
| `@actualwave/deferred-data-access/resource` | `Resource`, `ResourcePool`, `ResourcePoolRegistry`, `getDefaultResourcePool`, `isResourceObject`, `createResource` |
| `@actualwave/deferred-data-access/record` | `recordHandlerCalls`, `latestCall`, `latestCallFor`, `clearLatestCalls` |
| `@actualwave/deferred-data-access/utils` | `IdOwner`, `generateId`, `createUIDGenerator`, `isReservedPropertyName`, `ReservedPropertyNames`, `reject` |
| `@actualwave/deferred-data-access/interface` | `initialize`, `InterfaceType`, `MessageType`, `createSubscriberFns`, `findEventEmitter`, `findMessagePort` |

### recordHandlerCalls

Wraps a `CommandHandler` to track the latest in-flight call Promise, useful for implementing loading indicators or sequential request logic:

```typescript
import { recordHandlerCalls, latestCall, latestCallFor } from '@actualwave/deferred-data-access/record';

const trackedHandler = recordHandlerCalls(myHandler);
const wrap = handle(trackedHandler);

const proxy = wrap(rootObject);
proxy.doWork();

// latestCall() returns the Promise of the most recent handler invocation
await latestCall();

// latestCallFor(context) returns the Promise for a specific context Promise
```

---

## Projects built on DDA

- [RESTObject](https://github.com/burdiuz/js-deferred-data-access/tree/master/packages/rest-object) — REST API access using dot notation
- [WorkerInterface](https://github.com/burdiuz/js-deferred-data-access/tree/master/packages/worker-interface) — transparent proxy to a Web Worker's API
