import 'fake-indexeddb/auto';
import { createIdbProxy } from './idb-proxy';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

let dbCounter = 0;
const uniqueDbName = () => `test-db-${++dbCounter}`;

const upgrade = (db: IDBDatabase) => {
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('email', 'email', { unique: true });
  store.createIndex('age', 'age', { unique: false });
};

const makeDb = () => createIdbProxy(uniqueDbName(), { version: 1, upgrade });

const ALICE: User = { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 };
const BOB: User = { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 };
const CAROL: User = { id: 3, name: 'Carol', email: 'carol@example.com', age: 35 };

const seedUsers = async (db: ReturnType<typeof makeDb>) => {
  await db.users.put(ALICE);
  await db.users.put(BOB);
  await db.users.put(CAROL);
};

// ---------------------------------------------------------------------------
// put / get
// ---------------------------------------------------------------------------

describe('put and get', () => {
  it('put stores a record and get retrieves it', async () => {
    const db = makeDb();
    await db.users.put(ALICE);
    const result = await db.users.get(1);
    expect(result).toEqual(ALICE);
  });

  it('get returns undefined for missing key', async () => {
    const db = makeDb();
    const result = await db.users.get(999);
    expect(result).toBeUndefined();
  });

  it('put overwrites an existing record', async () => {
    const db = makeDb();
    await db.users.put(ALICE);
    const updated = { ...ALICE, name: 'Alicia' };
    await db.users.put(updated);
    expect(await db.users.get(1)).toEqual(updated);
  });
});

// ---------------------------------------------------------------------------
// add
// ---------------------------------------------------------------------------

describe('add', () => {
  it('add inserts a new record', async () => {
    const db = makeDb();
    await db.users.add(BOB);
    expect(await db.users.get(2)).toEqual(BOB);
  });

  it('add rejects on duplicate key', async () => {
    const db = makeDb();
    await db.users.put(ALICE);
    await expect(async () => {
      await db.users.add(ALICE);
    }).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// delete
// ---------------------------------------------------------------------------

describe('delete', () => {
  it('removes the record with the given key', async () => {
    const db = makeDb();
    await db.users.put(ALICE);
    await db.users.delete(1);
    expect(await db.users.get(1)).toBeUndefined();
  });

  it('delete on missing key does not throw', async () => {
    const db = makeDb();
    await db.users.delete(999);
  });
});

// ---------------------------------------------------------------------------
// getAll
// ---------------------------------------------------------------------------

describe('getAll', () => {
  it('returns all records', async () => {
    const db = makeDb();
    await seedUsers(db);
    const all = await db.users.getAll();
    expect(all).toHaveLength(3);
    expect(all).toEqual(expect.arrayContaining([ALICE, BOB, CAROL]));
  });

  it('returns empty array when store is empty', async () => {
    const db = makeDb();
    expect(await db.users.getAll()).toEqual([]);
  });

  it('limits results with count argument', async () => {
    const db = makeDb();
    await seedUsers(db);
    const limited = await db.users.getAll(null, 2);
    expect(limited).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// count
// ---------------------------------------------------------------------------

describe('count', () => {
  it('returns the number of records', async () => {
    const db = makeDb();
    await seedUsers(db);
    expect(await db.users.count()).toBe(3);
  });

  it('returns 0 for an empty store', async () => {
    const db = makeDb();
    expect(await db.users.count()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// clear
// ---------------------------------------------------------------------------

describe('clear', () => {
  it('removes all records', async () => {
    const db = makeDb();
    await seedUsers(db);
    await db.users.clear();
    expect(await db.users.count()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// iterate
// ---------------------------------------------------------------------------

describe('iterate', () => {
  it('calls callback for every record', async () => {
    const db = makeDb();
    await seedUsers(db);
    const collected: unknown[] = [];
    await db.users.iterate(null, (value) => collected.push(value));
    expect(collected).toHaveLength(3);
    expect(collected).toEqual(expect.arrayContaining([ALICE, BOB, CAROL]));
  });

  it('resolves immediately on empty store', async () => {
    const db = makeDb();
    const callback = jest.fn();
    await db.users.iterate(null, callback);
    expect(callback).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// index access
// ---------------------------------------------------------------------------

describe('index access', () => {
  it('index().get() retrieves by index key', async () => {
    const db = makeDb();
    await seedUsers(db);
    const result = await db.users.index('email').get('bob@example.com');
    expect(result).toEqual(BOB);
  });

  it('index().get() returns undefined for missing index key', async () => {
    const db = makeDb();
    await seedUsers(db);
    const result = await db.users.index('email').get('missing@example.com');
    expect(result).toBeUndefined();
  });

  it('index().getAll() returns all matching records', async () => {
    const db = makeDb();
    await seedUsers(db);
    const all = await db.users.index('email').getAll();
    expect(all).toHaveLength(3);
  });

  it('index().count() returns the number of records via index', async () => {
    const db = makeDb();
    await seedUsers(db);
    expect(await db.users.index('email').count()).toBe(3);
  });

  it('index().iterate() calls callback for every record', async () => {
    const db = makeDb();
    await seedUsers(db);
    const collected: unknown[] = [];
    await db.users.index('email').iterate(null, (v) => collected.push(v));
    expect(collected).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// error cases
// ---------------------------------------------------------------------------

describe('error cases', () => {
  it('throws for unknown operation', async () => {
    const db = makeDb();
    await expect(async () => {
      await (db.users as any).unknownOp();
    }).rejects.toThrow('unknown IDB operation');
  });

  it('throws when attempting a write operation on an index', async () => {
    const db = makeDb();
    await expect(async () => {
      await (db.users.index('email') as any).put({ id: 99, name: 'X', email: 'x@x.com', age: 1 });
    }).rejects.toThrow('cannot perform "put" on an index');
  });
});
