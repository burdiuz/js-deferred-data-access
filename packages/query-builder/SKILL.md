---
name: "query-builder"
description: "DDA lazy-mode proxy that converts dot-notation access chains into QueryDescriptor arrays and forwards them to a resolver. Use when building a GraphQL-style query API, batching multiple resolver calls into one round-trip, or translating property access patterns into structured query objects."
license: "MIT"
compatibility: "Node.js 18+. Browser. TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/query-builder"
---

# @actualwave/query-builder

Uses DDA lazy mode to collect an entire access chain before execution. The handler converts the `CommandChain` to a `QueryDescriptor` array and passes it to a user-supplied resolver.

## Key exports

```typescript
import { createQueryProxy, createBatchingResolver, buildDescriptor } from '@actualwave/query-builder';
import type { QueryDescriptor, QueryStep, QueryResolver, BatchResolver } from '@actualwave/query-builder';
```

## Core pattern

```typescript
const proxy = createQueryProxy<MySchema>(async (descriptor) =>
  fetch('/api', { method: 'POST', body: JSON.stringify(descriptor) }).then(r => r.json())
);

const name = await proxy.user(1).name;
```

## Batching

```typescript
const resolver = createBatchingResolver(
  async (descriptors) => fetchBatch(descriptors), // returns same-length array
  { windowMs: 0 },                                 // 0 = microtask flush
);
const proxy = createQueryProxy(resolver);
```

## `QueryStep` union

```typescript
{ type: 'get',    name: string }
{ type: 'call',   name: string; args: unknown[] }
{ type: 'apply';  args: unknown[] }
{ type: 'index';  index: number }   // numeric property names
{ type: 'set',    name: string; value: unknown }
{ type: 'delete', name: string }
```

`proxy.user(1).name` → `[{ type:'call', name:'user', args:[1] }, { type:'get', name:'name' }]`

## `buildDescriptor(command)`

Converts a raw DDA `ICommandList` to a `QueryDescriptor`. Nodes are reversed from head→tail to root-first order. Use when integrating query-builder into a custom DDA handler.

## Key invariants

- Uses lazy mode (`handle(h, true)`) — handler fires once on `await`, not per access.
- `createBatchingResolver` collects calls that arrive before the next microtask (or `windowMs` timeout) into one batch. The `batchFn` result array **must** be the same length as the input.
- Numeric property names become `{ type: 'index', index: n }` steps so resolvers can distinguish array indexing from string keys.
