// Each step in a QueryDescriptor describes one node in the access chain,
// using human-readable type strings so descriptors are self-contained and
// can be serialised / sent over the wire without DDA knowledge.
export type QueryStep =
  | { type: 'get'; name: string }
  | { type: 'call'; name: string; args: unknown[] }
  | { type: 'index'; index: number }
  | { type: 'set'; name: string; value: unknown }
  | { type: 'delete'; name: string }
  | { type: 'apply'; args: unknown[] };

// An ordered list of steps from root to leaf describing the full access path.
// e.g. `api.user(1).posts[0].title` → [call('user',[1]), get('posts'), index(0), get('title')]
export type QueryDescriptor = QueryStep[];

// A resolver receives one descriptor and returns the result for that access.
export type QueryResolver = (query: QueryDescriptor) => Promise<unknown>;

// A batch resolver receives all descriptors that fired in the same microtask
// tick and must return a same-length array of results.
export type BatchResolver = (queries: QueryDescriptor[]) => Promise<unknown[]>;

export interface BatchingOptions {
  // Milliseconds to wait before flushing. 0 (default) means flush on the
  // next microtask via Promise.resolve().then(), which covers the common
  // "fire multiple awaits in the same tick" scenario.
  windowMs?: number;
}
