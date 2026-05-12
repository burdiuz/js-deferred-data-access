# @actualwave/query-builder

Build query descriptors from dot-notation property access chains and forward them to a resolver function. Optionally batch multiple queries into one round-trip.

## Installation

```bash
npm install @actualwave/query-builder
```

## Usage

```typescript
import { createQueryProxy, createBatchingResolver } from '@actualwave/query-builder';

// Simple resolver
const proxy = createQueryProxy<{ user(id: number): { name: string; posts: Post[] } }>(
  async (descriptor) => {
    return fetch('/api/query', {
      method: 'POST',
      body: JSON.stringify(descriptor),
    }).then(r => r.json());
  }
);

const name = await proxy.user(1).name;
const posts = await proxy.user(1).posts;
```

## Batching

Collect all queries that arrive before the next microtask flush into one request:

```typescript
const resolver = createBatchingResolver(
  async (descriptors) => {
    const results = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify(descriptors),
    }).then(r => r.json());
    return results; // must be same-length array
  },
  { windowMs: 0 }, // extend window with setTimeout if needed
);

const proxy = createQueryProxy(resolver);

// These two fire together in one batch request:
const [name, role] = await Promise.all([proxy.user(1).name, proxy.user(1).role]);
```

## QueryDescriptor format

Each access chain becomes an array of `QueryStep` objects sent to the resolver:

```typescript
type QueryStep =
  | { type: 'get';    name: string }
  | { type: 'call';   name: string; args: unknown[] }
  | { type: 'apply';  args: unknown[] }
  | { type: 'index';  index: number }
  | { type: 'set';    name: string; value: unknown }
  | { type: 'delete'; name: string }
```

`proxy.user(1).name` produces:
```json
[{ "type": "call", "name": "user", "args": [1] }, { "type": "get", "name": "name" }]
```

## API

### `createQueryProxy<T>(resolver): T`

Creates a proxy typed as `T`. Every `await` sends the accumulated access chain to `resolver`.

### `buildDescriptor(command): QueryDescriptor`

Converts a raw DDA `ICommandList` to a `QueryDescriptor`. Useful when integrating query-builder into a custom DDA handler.

### `createBatchingResolver(batchFn, options?): QueryResolver`

| Option | Type | Default | Description |
|---|---|---|---|
| `windowMs` | `number` | `0` | Extra collection window (setTimeout). `0` = microtask flush only. |

`batchFn` receives `QueryDescriptor[]` and must return `Promise<unknown[]>` of the same length.
