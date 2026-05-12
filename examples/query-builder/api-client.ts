import {
  createQueryProxy,
  createBatchingResolver,
  type QueryDescriptor,
} from '@actualwave/query-builder';

// ---------------------------------------------------------------------------
// 1. Simple resolver — forwards descriptors to a JSON API
// ---------------------------------------------------------------------------

const simpleResolver = async (query: QueryDescriptor): Promise<unknown> => {
  // Translate the descriptor into an HTTP request.
  // e.g. [call('users',[]), get('name')] → GET /api/users?fields=name
  const response = await fetch('/api/query', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(query),
  });
  return response.json();
};

// The generic parameter mirrors the remote API schema for autocompletion.
interface API {
  users(page?: number): {
    items: Array<{ id: number; name: string; email: string }>;
    total: number;
  };
  post(id: number): {
    title: string;
    body:  string;
    author: { name: string };
  };
}

const api = createQueryProxy<API>(simpleResolver);

const users = await (api as any).users(1);
console.log('First user:', users.items[0].name);

const post = await (api as any).post(42);
console.log('Post title:', post.title);

// ---------------------------------------------------------------------------
// 2. Batching resolver — all awaits in the same tick share one HTTP request
// ---------------------------------------------------------------------------

const batchingResolver = createBatchingResolver(
  async (queries: QueryDescriptor[]) => {
    const response = await fetch('/api/batch', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ queries }),
    });
    const { results } = await response.json();
    return results; // must be same length as queries
  },
  { windowMs: 0 }, // flush on next microtask (default)
);

const batchApi = createQueryProxy<API>(batchingResolver);

// These three awaits fire in the same synchronous turn → one batch request
const [p1, p2, p3] = await Promise.all([
  (batchApi as any).post(1),
  (batchApi as any).post(2),
  (batchApi as any).post(3),
]);

console.log('Batch results:', p1.title, p2.title, p3.title);
