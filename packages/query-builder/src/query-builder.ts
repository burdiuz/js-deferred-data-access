import { handle } from '@actualwave/deferred-data-access';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';
import type { ICommandList, ICommandChain } from '@actualwave/deferred-data-access/utils';
import type { QueryDescriptor, QueryStep, QueryResolver, BatchResolver, BatchingOptions } from './types';

// Converts a DDA command chain into a QueryDescriptor.
//
// command.map() yields nodes head→tail (deepest→shallowest).
// Reversed = tail→head = root-first traversal, which matches the written
// access order the resolver expects (e.g. [call('user',[1]), get('name')]).
//
// Numeric property names are emitted as `index` steps so resolvers can
// distinguish `posts[0]` from `posts['0']` if they choose to.
export const buildDescriptor = (command: ICommandList): QueryDescriptor => {
  const nodes = command.map((n: ICommandChain) => n).reverse();

  return nodes.map((node): QueryStep => {
    switch (node.type) {
      case ProxyCommand.METHOD_CALL:
        return { type: 'call', name: String(node.name), args: (node.value as unknown[]) ?? [] };

      case ProxyCommand.GET: {
        const name = String(node.name);
        const asNumber = Number(name);
        if (!isNaN(asNumber) && String(asNumber) === name) {
          return { type: 'index', index: asNumber };
        }
        return { type: 'get', name };
      }

      case ProxyCommand.APPLY:
        return { type: 'apply', args: (node.value as unknown[]) ?? [] };

      case ProxyCommand.SET:
        return { type: 'set', name: String(node.name), value: node.value };

      case ProxyCommand.DELETE_PROPERTY:
        return { type: 'delete', name: String(node.name) };

      default:
        return { type: 'get', name: String(node.name) };
    }
  });
};

// Creates a proxy whose property accesses, calls, and mutations are
// accumulated into a QueryDescriptor and forwarded to `resolver` when awaited.
//
// Uses DDA's lazy mode: the handler fires exactly once per `await`, receiving
// the full chain so the entire access path is available as a descriptor.
//
// The generic parameter `T` lets callers mirror a schema type for
// autocompletion: `createQueryProxy<{ user(id: number): { name: string } }>(r)`
export const createQueryProxy = <T = unknown>(resolver: QueryResolver): T => {
  const wrap = handle(async (command: ICommandList) => resolver(buildDescriptor(command)));
  return wrap({}) as T;
};

// Wraps a BatchResolver into a QueryResolver.
//
// All resolver calls that arrive before the next microtask flush are
// accumulated into one batch. The BatchResolver receives the full array and
// must return a same-length array of results. Individual callers receive
// their matching result transparently.
//
// Use `windowMs > 0` to extend the collection window with a setTimeout if
// your data source benefits from slightly longer batching.
export const createBatchingResolver = (
  batchFn: BatchResolver,
  { windowMs = 0 }: BatchingOptions = {},
): QueryResolver => {
  const pending: {
    query: QueryDescriptor;
    resolve: (v: unknown) => void;
    reject: (e: unknown) => void;
  }[] = [];
  let scheduled = false;

  const flush = async () => {
    scheduled = false;
    const batch = pending.splice(0);
    try {
      const results = await batchFn(batch.map((e) => e.query));
      for (let i = 0; i < batch.length; i++) {
        batch[i].resolve(results[i]);
      }
    } catch (err) {
      for (const entry of batch) {
        entry.reject(err);
      }
    }
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    if (windowMs > 0) {
      setTimeout(flush, windowMs);
    } else {
      Promise.resolve().then(flush);
    }
  };

  return (query: QueryDescriptor): Promise<unknown> =>
    new Promise((resolve, reject) => {
      pending.push({ query, resolve, reject });
      schedule();
    });
};
