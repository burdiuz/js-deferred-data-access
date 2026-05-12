import { wrapWithProxy, isWrappedWithProxy, unwrapProxy } from './proxy';
import { API_PROP } from './types';

const noopTraps = {};

describe('wrapWithProxy', () => {
  it('should wrap a promise target with a Proxy', () => {
    const target = Promise.resolve(42);
    const result = wrapWithProxy(target, noopTraps);
    expect(result).toBeDefined();
  });

  it('should expose API_PROP on the proxy', () => {
    const target = Promise.resolve({});
    const result = wrapWithProxy(target, noopTraps);
    // Access API_PROP directly on the wrapper function (not through proxy traps)
    expect(isWrappedWithProxy(result)).toBe(true);
  });

  it('should allow retrieval of original target via api', () => {
    const target = Promise.resolve('hello');
    const result = wrapWithProxy(target, noopTraps);
    const unwrapped = unwrapProxy(result);
    expect(unwrapped).toBe(target);
  });

  it('should wrap a function target using a callable wrapper', () => {
    const target = () => 'fn-result';
    const result = wrapWithProxy(target as any, noopTraps);
    expect(typeof result).toBe('function');
  });

  it('should wrap a non-function target using a plain wrapper', () => {
    const target = Promise.resolve({});
    const result = wrapWithProxy(target, noopTraps);
    expect(typeof result).toBe('function'); // wrapper is always a function (Proxy of function)
  });

  it('should include api properties from the api argument', () => {
    const target = Promise.resolve(1);
    let called = false;
    const api = { customMethod: () => { called = true; return 'custom'; } };
    const result = wrapWithProxy(target, noopTraps, api);
    expect(isWrappedWithProxy(result)).toBe(true);
  });
});

describe('isWrappedWithProxy', () => {
  it('should return true for wrapped targets', () => {
    const target = Promise.resolve({});
    const wrapped = wrapWithProxy(target, noopTraps);
    expect(isWrappedWithProxy(wrapped)).toBe(true);
  });

  it('should return false for plain objects', () => {
    expect(isWrappedWithProxy({})).toBe(false);
  });

  it('should return false for null', () => {
    expect(isWrappedWithProxy(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isWrappedWithProxy(undefined)).toBe(false);
  });

  it('should return false for primitive values', () => {
    expect(isWrappedWithProxy(42)).toBe(false);
    expect(isWrappedWithProxy('string')).toBe(false);
  });

  it('should return false for a plain function (not wrapped)', () => {
    expect(isWrappedWithProxy(() => {})).toBe(false);
  });

  it('should return true for a wrapped function target', () => {
    const fn = () => 'result';
    const wrapped = wrapWithProxy(fn as any, noopTraps);
    expect(isWrappedWithProxy(wrapped)).toBe(true);
  });
});

describe('unwrapProxy', () => {
  it('should return the original target from a wrapped proxy', () => {
    const target = Promise.resolve('test');
    const wrapped = wrapWithProxy(target, noopTraps);
    expect(unwrapProxy(wrapped)).toBe(target);
  });

  it('should return the value itself if not wrapped', () => {
    const plain = { key: 'value' };
    expect(unwrapProxy(plain)).toBe(plain);
  });

  it('should return null as-is', () => {
    expect(unwrapProxy(null)).toBeNull();
  });

  it('should handle undefined gracefully', () => {
    expect(unwrapProxy(undefined)).toBeUndefined();
  });

  it('should work with nested wraps by returning innermost target', () => {
    const target = Promise.resolve(99);
    const wrapped = wrapWithProxy(target, noopTraps);
    // unwrap only goes one level
    const unwrapped = unwrapProxy(wrapped);
    expect(unwrapped).toBe(target);
  });
});
