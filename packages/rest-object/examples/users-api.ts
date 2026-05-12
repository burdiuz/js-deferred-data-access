import { createRESTObject } from '@actualwave/rest-object';

// ---------------------------------------------------------------------------
// REST client for a standard JSON API
// ---------------------------------------------------------------------------

interface User {
  id:    number;
  name:  string;
  email: string;
  role:  'admin' | 'user';
}

// Base URL is the root of all generated paths.
// An optional interceptor lets you inject auth headers, base paths, etc.
const api = createRESTObject('https://api.example.com/v1', (req) => {
  req.headers = {
    ...req.headers,
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
  return req;
});

// ---------------------------------------------------------------------------
// GET  /v1/users
// ---------------------------------------------------------------------------

const { body: users } = await (api as any).users.read() as { body: User[] };
console.log('All users:', users.map(u => u.name));

// ---------------------------------------------------------------------------
// GET  /v1/users/42
// ---------------------------------------------------------------------------

const { body: alice } = await (api as any).users[42].read() as { body: User };
console.log('User:', alice.name, alice.email);

// ---------------------------------------------------------------------------
// POST /v1/users  (create)
// ---------------------------------------------------------------------------

const { body: created, response } = await (api as any).users.create(
  undefined,
  { name: 'Bob', email: 'bob@example.com', role: 'user' },
) as { body: User; response: Response };

console.log('Created:', created.id, response.status); // 201

// ---------------------------------------------------------------------------
// PATCH /v1/users/42  (partial update)
// ---------------------------------------------------------------------------

await (api as any).users[42].patch(undefined, { role: 'admin' });

// ---------------------------------------------------------------------------
// DELETE /v1/users/42
// ---------------------------------------------------------------------------

await (api as any).users[42].delete();

// ---------------------------------------------------------------------------
// forLatest — reads the cached result of the most recent call for a context
// ---------------------------------------------------------------------------

const userProxy = (api as any).users[99];
await userProxy.read();
const cached = await userProxy.forLatest();
console.log('Cached body:', (cached as any)?.body);
