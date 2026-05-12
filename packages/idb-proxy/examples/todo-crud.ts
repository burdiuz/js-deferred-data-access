import { createIdbProxy } from '@actualwave/idb-proxy';

// ---------------------------------------------------------------------------
// Todo-list CRUD backed by IndexedDB
// ---------------------------------------------------------------------------

interface Todo {
  id:        number;
  title:     string;
  done:      boolean;
  createdAt: number;
}

const db = createIdbProxy('todos-db', {
  version: 1,
  upgrade(database) {
    if (!database.objectStoreNames.contains('todos')) {
      const store = database.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
      store.createIndex('by-done', 'done');
    }
  },
});

// Alias for the typed store
const todos = (db as any).todos;

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

const newId = await todos.add({
  title: 'Buy groceries',
  done: false,
  createdAt: Date.now(),
});
console.log('Inserted with id:', newId);

await todos.add({ title: 'Read a book', done: false, createdAt: Date.now() });
await todos.add({ title: 'Go for a walk', done: true,  createdAt: Date.now() });

// ---------------------------------------------------------------------------
// Read one / read all
// ---------------------------------------------------------------------------

const item = await todos.get(newId) as Todo;
console.log('Fetched:', item.title);

const all = await todos.getAll() as Todo[];
console.log('Total todos:', all.length);

// ---------------------------------------------------------------------------
// Query via index
// ---------------------------------------------------------------------------

const pending = await todos.index('by-done').getAll(false) as Todo[];
console.log('Pending todos:', pending.map(t => t.title));

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

await todos.put({ ...item, done: true });

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

await todos.delete(newId);
console.log('After delete:', (await todos.getAll() as Todo[]).length);

// ---------------------------------------------------------------------------
// Count & iterate
// ---------------------------------------------------------------------------

const count = await todos.count() as number;
console.log('Remaining:', count);

await todos.iterate(null, (todo: Todo) => {
  console.log('-', todo.title, todo.done ? '✓' : '○');
});
