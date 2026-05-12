import {
  recordHandlerCalls,
  latestCall,
  latestCallFor,
  clearLatestCalls,
} from './record';
import { CommandChain } from '@actualwave/deferred-data-access/command';

const makeCommand = (): CommandChain =>
  new CommandChain(undefined, 'P:get', 'prop', undefined);

const makeWrap = () => jest.fn();

describe('recordHandlerCalls', () => {
  let resolveLatest: (v?: unknown) => void;
  let latestPromise: Promise<unknown>;

  const makeResolvedHandler = (value: unknown = 'ok') =>
    jest.fn().mockResolvedValue(value);

  const makeRejectedHandler = (error = 'fail') =>
    jest.fn().mockRejectedValue(error);

  beforeEach(() => {
    clearLatestCalls();
  });

  it('should return a wrapped handler function', () => {
    const handler = makeResolvedHandler();
    const wrapped = recordHandlerCalls(handler);
    expect(typeof wrapped).toBe('function');
  });

  it('should call the original handler with same arguments', async () => {
    const handler = makeResolvedHandler('result');
    const wrapped = recordHandlerCalls(handler);
    const cmd = makeCommand();
    const ctx = Promise.resolve({}) as any;
    const wrap = makeWrap();

    await wrapped(cmd, ctx, wrap);
    expect(handler).toHaveBeenCalledWith(cmd, ctx, wrap);
  });

  it('should return the same promise as the inner handler', async () => {
    const value = { data: 42 };
    const handler = makeResolvedHandler(value);
    const wrapped = recordHandlerCalls(handler);
    const ctx = Promise.resolve({}) as any;
    const result = await wrapped(makeCommand(), ctx, makeWrap());
    expect(result).toEqual(value);
  });

  it('should record latestCall', async () => {
    const handler = makeResolvedHandler('latest');
    const wrapped = recordHandlerCalls(handler);
    await wrapped(makeCommand(), undefined, makeWrap());
    expect(latestCall()).toBeInstanceOf(Promise);
  });

  it('should update latestCall on each invocation', async () => {
    const handler = makeResolvedHandler();
    const wrapped = recordHandlerCalls(handler);
    await wrapped(makeCommand(), undefined, makeWrap());
    const first = latestCall();
    await wrapped(makeCommand(), undefined, makeWrap());
    const second = latestCall();
    expect(second).not.toBe(first);
  });

  it('should store call per context', async () => {
    const handler = makeResolvedHandler('ctx-value');
    const wrapped = recordHandlerCalls(handler);
    const ctx = Promise.resolve({}) as any;
    const callPromise = wrapped(makeCommand(), ctx, makeWrap());
    // Check while the call is still in-flight — cleanup runs after resolution
    const stored = latestCallFor(ctx);
    expect(stored).toBeInstanceOf(Promise);
    await callPromise;
  });

  it('should not store call when context is undefined', async () => {
    clearLatestCalls();
    const handler = makeResolvedHandler();
    const wrapped = recordHandlerCalls(handler);
    await wrapped(makeCommand(), undefined, makeWrap());
    // No context-based entry stored — latestCallFor(undefined) stays undefined
    expect(latestCallFor(undefined as any)).toBeUndefined();
  });
});

describe('latestCall', () => {
  beforeEach(() => {
    clearLatestCalls();
  });

  it('should return a promise even before any calls are made (initial state)', () => {
    // module-level `latest` is initialized to Promise.resolve()
    expect(latestCall()).toBeInstanceOf(Promise);
  });
});

describe('latestCallFor', () => {
  beforeEach(() => {
    clearLatestCalls();
  });

  it('should return undefined for an unknown context', () => {
    const ctx = Promise.resolve({}) as any;
    expect(latestCallFor(ctx)).toBeUndefined();
  });

  it('should return the stored promise for a known context', async () => {
    const handler = jest.fn().mockResolvedValue('test');
    const wrapped = recordHandlerCalls(handler);
    const ctx = Promise.resolve({}) as any;
    const callPromise = wrapped(makeCommand(), ctx, makeWrap());
    // Check while the call is still in-flight — cleanup runs after resolution
    expect(latestCallFor(ctx)).toBeInstanceOf(Promise);
    await callPromise;
  });
});

describe('clearLatestCalls', () => {
  it('should clear all stored context-to-promise mappings', async () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrapped = recordHandlerCalls(handler);
    const ctx = Promise.resolve({}) as any;
    await wrapped(makeCommand(), ctx, makeWrap());
    clearLatestCalls();
    expect(latestCallFor(ctx)).toBeUndefined();
  });
});
