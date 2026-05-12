---
name: "idb-proxy"
description: "DDA proxy that maps dot-notation property access to IndexedDB operations. Use when reading or writing to IndexedDB via a clean async API, performing CRUD on object stores, querying indexes, or iterating cursors without writing IDB boilerplate."
license: "MIT"
compatibility: "Browser environments with IndexedDB support. TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/idb-proxy"
---

# @actualwave/idb-proxy

A DDA-based proxy that translates dot-notation property access into IndexedDB operations. `db.users.get(1)` opens a `readonly` transaction on the `users` store and returns `store.get(1)` as a Promise.

## Key export

```typescript
import { createIdbProxy } from '@actualwave/idb-proxy';
```

## Setup

```typescript
const db = createIdbProxy('my-db', {
  version: 1,
  upgrade(db) {
    db.createObjectStore('users', { keyPath: 'id' });
  },
});
```

## Store operations

| Call | IDB equivalent | Mode |
|---|---|---|
| `db.store.get(key)` | `store.get(key)` | readonly |
| `db.store.getAll(q?, n?)` | `store.getAll(q, n)` | readonly |
| `db.store.count(q?)` | `store.count(q)` | readonly |
| `db.store.put(v, k?)` | `store.put(v, k)` | readwrite |
| `db.store.add(v, k?)` | `store.add(v, k)` | readwrite |
| `db.store.delete(key)` | `store.delete(key)` | readwrite |
| `db.store.clear()` | `store.clear()` | readwrite |
| `db.store.iterate(q, cb)` | cursor via `openCursor` | readonly |

## Index operations

Prefix any read with `.index(name)`:
```typescript
await db.users.index('email').get('a@b.com');
await db.users.index('age').getAll(IDBKeyRange.lowerBound(18));
```

## Key invariants

- DB connection is opened lazily on first operation and cached.
- Each operation runs in its own transaction — not suitable for multi-step atomic operations (use IDB API directly for those).
- `IdbProxy` is typed as `Record<string, IdbStoreProxy>` — store names are dynamic.
