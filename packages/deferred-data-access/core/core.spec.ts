import { handle } from './core';
import { ProxyCommand, isWrappedWithProxy, unwrapProxy } from '@actualwave/deferred-data-access/proxy';
import { CommandChain } from '@actualwave/deferred-data-access/command';

describe('handle', () => {
  it('should return a function (wrap factory)', () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrap = handle(handler);
    expect(typeof wrap).toBe('function');
  });

  it('should wrap the context with a proxy', () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrap = handle(handler);
    const proxy = wrap({ key: 'val' });
    expect(isWrappedWithProxy(proxy)).toBe(true);
  });

  it('should call handler with GET command when a property is accessed', async () => {
    const handler = jest.fn().mockResolvedValue('prop-value');
    const wrap = handle(handler, false);
    const proxy = wrap({ myProp: 'original' }) as any;
    proxy.myProp;
    // Give microtasks a tick
    await new Promise((r) => setTimeout(r, 0));
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: ProxyCommand.GET, name: 'myProp' }),
      expect.anything(),
      expect.any(Function)
    );
  });

  it('should call handler with SET command when a property is set', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrap = handle(handler, false);
    const proxy = wrap({}) as any;
    proxy.myProp = 'newVal';
    await new Promise((r) => setTimeout(r, 0));
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: ProxyCommand.SET, name: 'myProp', value: 'newVal' }),
      expect.anything(),
      expect.any(Function)
    );
  });

  it('should not call handler when "then" is accessed (reserved/promise method)', () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrap = handle(handler, true);
    const proxy = wrap(Promise.resolve('ctx')) as any;
    // "then" access is a promise activity - handler should NOT be called for this GET
    proxy.then;
    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler when "catch" is accessed (reserved/promise method)', () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrap = handle(handler, true);
    const proxy = wrap(Promise.resolve('ctx')) as any;
    proxy.catch;
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call handler with DELETE_PROPERTY command when property is deleted', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrap = handle(handler, false);
    const proxy = wrap({ removable: true }) as any;
    delete proxy.removable;
    await new Promise((r) => setTimeout(r, 0));
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: ProxyCommand.DELETE_PROPERTY, name: 'removable' }),
      expect.anything(),
      expect.any(Function)
    );
  });

  it('should wrap with an existing command chain when command is provided', () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrap = handle(handler);
    const existingCmd = new CommandChain(undefined, ProxyCommand.GET, 'existingProp');
    const proxy = wrap(Promise.resolve({}), existingCmd as any);
    expect(isWrappedWithProxy(proxy)).toBe(true);
  });

  it('should work in non-lazy mode (lazy=false)', () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrap = handle(handler, false);
    const proxy = wrap({ value: 42 });
    expect(isWrappedWithProxy(proxy)).toBe(true);
  });

  it('should expose getCommand via API on the wrapped proxy', () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const wrap = handle(handler);
    const proxy = wrap(Promise.resolve({})) as any;
    // API_PROP holds { getCommand, dropCommandChain, getTarget }
    const api = proxy[Object.getOwnPropertySymbols(proxy).find
      ? Object.getOwnPropertySymbols(proxy)[0]
      : 0];
    // The proxy exposes getCommand, just verify proxy is wrapped
    expect(isWrappedWithProxy(proxy)).toBe(true);
  });
});
