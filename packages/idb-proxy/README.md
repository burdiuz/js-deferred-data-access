# idb-proxy

A DDA-based proxy that translates dot-notation property access and method calls into IndexedDB operations, hiding the verbose IDB event-driven API behind a clean async interface.

## Installation

```bash
npm install @actualwave/idb-proxy
```

## Usage

```typescript
import { createIdbProxy } from '@actualwave/idb-proxy';

const db = createIdbProxy('my-database', {
  version: 1,
  upgrade(db) {
    const store = db.createObjectStore('users', { keyPath: 'id' });
    store.createIndex('email', 'email', { unique: true });
  },
});

// Read
const user = await db.users.get(42);

// Write
await db.users.put({ id: 42, name: 'Alice' });
await db.users.delete(42);

// Query all
const everyone = await db.users.getAll();

// Count
const total = await db.users.count();

// Index access
const byEmail = await db.users.index('email').get('alice@example.com');

// Cursor iteration
await db.users.iterate(null, (user) => {
  console.log(user);
});
```

## API

### `createIdbProxy(dbName, options?)`

| Option | Type | Default | Description |
|---|---|---|---|
| `version` | `number` | — | Database version passed to `indexedDB.open` |
| `upgrade` | `(db, oldVersion, newVersion) => void` | — | Called on version upgrade to create/modify stores and indexes |

Returns an `IdbProxy` — a DDA proxy where each property access maps to an object store.

### Store operations

| Pattern | IDB equivalent | Transaction mode |
|---|---|---|
| `db.store.get(key)` | `store.get(key)` | readonly |
| `db.store.getAll(query?, count?)` | `store.getAll(query, count)` | readonly |
| `db.store.count(query?)` | `store.count(query)` | readonly |
| `db.store.put(value, key?)` | `store.put(value, key)` | readwrite |
| `db.store.add(value, key?)` | `store.add(value, key)` | readwrite |
| `db.store.delete(key)` | `store.delete(key)` | readwrite |
| `db.store.clear()` | `store.clear()` | readwrite |
| `db.store.iterate(query?, callback)` | cursor via `store.openCursor` | readonly |

### Index operations

Prefix any read operation with `.index(name)`:

```typescript
await db.users.index('email').get('alice@example.com');
await db.users.index('age').getAll(IDBKeyRange.lowerBound(18));
await db.users.index('email').count();
await db.users.index('email').iterate(null, (record) => { ... });
```

Write operations (`put`, `add`, `delete`, `clear`) are not available on indexes.

## Notes

- The database connection is opened lazily on the first operation and cached for subsequent calls.
- Each operation runs in its own transaction. For multi-operation transactions, use the IDB API directly.
- Errors from IDB operations surface as rejected Promises. The original `DOMException` is available on `error.cause`.
