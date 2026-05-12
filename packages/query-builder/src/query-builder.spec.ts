import { buildDescriptor, createQueryProxy, createBatchingResolver } from './query-builder';
import type { QueryDescriptor, QueryResolver, BatchResolver } from './types';

// ---------------------------------------------------------------------------
// buildDescriptor
// ---------------------------------------------------------------------------

describe('buildDescriptor', () => {
  it('GET produces a get step', async () => {
    const resolver = jest.fn().mockResolvedValue('ok');
    const api = createQueryProxy(resolver);
    await (api as any).name;
    expect(resolver).toHaveBeenCalledWith([{ type: 'get', name: 'name' }]);
  });

  it('numeric string GET produces an index step', async () => {
    const resolver = jest.fn().mockResolvedValue('ok');
    const api = createQueryProxy(resolver);
    await (api as any)[2];
    expect(resolver).toHaveBeenCalledWith([{ type: 'index', index: 2 }]);
  });

  it('non-numeric string produces a get step, not index', async () => {
    const resolver = jest.fn().mockResolvedValue('ok');
    const api = createQueryProxy(resolver);
    await (api as any)['0abc'];
    expect(resolver).toHaveBeenCalledWith([{ type: 'get', name: '0abc' }]);
  });

  it('METHOD_CALL produces a call step with args', async () => {
    const resolver = jest.fn().mockResolvedValue('ok');
    const api = createQueryProxy(resolver);
    await (api as any).user(1, 'admin');
    expect(resolver).toHaveBeenCalledWith([{ type: 'call', name: 'user', args: [1, 'admin'] }]);
  });

  it('chained access produces root-first descriptor', async () => {
    const resolver = jest.fn().mockResolvedValue('ok');
    const api = createQueryProxy(resolver);
    await (api as any).user(1).name;
    expect(resolver).toHaveBeenCalledWith([
      { type: 'call', name: 'user', args: [1] },
      { type: 'get', name: 'name' },
    ]);
  });

  it('deep chain with numeric index is root-first', async () => {
    const resolver = jest.fn().mockResolvedValue('ok');
    const api = createQueryProxy(resolver);
    await (api as any).posts[0].title;
    expect(resolver).toHaveBeenCalledWith([
      { type: 'get', name: 'posts' },
      { type: 'index', index: 0 },
      { type: 'get', name: 'title' },
    ]);
  });

  it('returns the resolver value', async () => {
    const resolver = jest.fn().mockResolvedValue(42);
    const api = createQueryProxy(resolver);
    const result = await (api as any).answer;
    expect(result).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// createQueryProxy — generic type pass-through
// ---------------------------------------------------------------------------

describe('createQueryProxy type-based access', () => {
  interface Schema {
    user(id: number): { name: string; age: number };
  }

  it('resolver is called with the correct descriptor for typed access', async () => {
    const resolver = jest.fn().mockResolvedValue({ name: 'Alice', age: 30 });
    const api = createQueryProxy<Schema>(resolver);
    await api.user(1);
    expect(resolver).toHaveBeenCalledWith([{ type: 'call', name: 'user', args: [1] }]);
  });
});

// ---------------------------------------------------------------------------
// createBatchingResolver — microtask batching
// ---------------------------------------------------------------------------

describe('createBatchingResolver', () => {
  it('collects concurrent awaits into a single batchFn call', async () => {
    const batchFn: BatchResolver = jest.fn().mockResolvedValue(['r1', 'r2']);
    const resolver = createBatchingResolver(batchFn);

    const p1 = resolver([{ type: 'get', name: 'a' }]);
    const p2 = resolver([{ type: 'get', name: 'b' }]);
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(batchFn).toHaveBeenCalledTimes(1);
    expect((batchFn as jest.Mock).mock.calls[0][0]).toEqual([
      [{ type: 'get', name: 'a' }],
      [{ type: 'get', name: 'b' }],
    ]);
    expect(r1).toBe('r1');
    expect(r2).toBe('r2');
  });

  it('sequential awaits across microtasks produce separate batches', async () => {
    const batchFn: BatchResolver = jest.fn()
      .mockResolvedValueOnce(['first'])
      .mockResolvedValueOnce(['second']);
    const resolver = createBatchingResolver(batchFn);

    await resolver([{ type: 'get', name: 'x' }]);
    await resolver([{ type: 'get', name: 'y' }]);

    expect(batchFn).toHaveBeenCalledTimes(2);
  });

  it('returns the matching result to each caller', async () => {
    const batchFn: BatchResolver = jest.fn().mockResolvedValue([10, 20, 30]);
    const resolver = createBatchingResolver(batchFn);

    const results = await Promise.all([
      resolver([{ type: 'get', name: 'a' }]),
      resolver([{ type: 'get', name: 'b' }]),
      resolver([{ type: 'get', name: 'c' }]),
    ]);
    expect(results).toEqual([10, 20, 30]);
  });

  it('rejects all pending queries when batchFn throws', async () => {
    const batchFn: BatchResolver = jest.fn().mockRejectedValue(new Error('boom'));
    const resolver = createBatchingResolver(batchFn);

    await expect(
      Promise.all([
        resolver([{ type: 'get', name: 'a' }]),
        resolver([{ type: 'get', name: 'b' }]),
      ]),
    ).rejects.toThrow('boom');
  });

  it('windowMs > 0 defers flush to setTimeout', async () => {
    jest.useFakeTimers();
    const batchFn: BatchResolver = jest.fn().mockResolvedValue(['ok']);
    const resolver = createBatchingResolver(batchFn, { windowMs: 100 });

    const p = resolver([{ type: 'get', name: 'a' }]);
    expect(batchFn).not.toHaveBeenCalled();

    jest.runAllTimers();
    await p;
    expect(batchFn).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
