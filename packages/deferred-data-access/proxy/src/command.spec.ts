import { ProxyCommand, generateProxyCommand, getMethodName, getMethodCallContext } from './command';
import { CommandChain } from '@actualwave/deferred-data-access/command';

describe('ProxyCommand enum', () => {
  it('should have correct string values', () => {
    expect(ProxyCommand.GET).toBe('P:get');
    expect(ProxyCommand.SET).toBe('P:set');
    expect(ProxyCommand.APPLY).toBe('P:apply');
    expect(ProxyCommand.DELETE_PROPERTY).toBe('P:del');
    expect(ProxyCommand.METHOD_CALL).toBe('P:call');
    expect(ProxyCommand.CONSTRUCT).toBe('P:new');
  });
});

describe('generateProxyCommand', () => {
  const ctx = Promise.resolve({}) as any;

  it('should generate a METHOD_CALL when lazy=true, APPLY type, and prev is GET', () => {
    const getNode = new CommandChain(undefined, ProxyCommand.GET, 'myMethod', undefined, ctx);
    const result = generateProxyCommand(getNode, ProxyCommand.APPLY, undefined, ['arg1'], ctx, true);
    expect(result.type).toBe(ProxyCommand.METHOD_CALL);
    expect(result.name).toBe('myMethod');
    expect(result.value).toEqual(['arg1']);
    expect(result.context).toBe(ctx);
    // METHOD_CALL should use getNode.prev as its prev (which is undefined here)
    expect(result.prev).toBeUndefined();
  });

  it('should NOT collapse to METHOD_CALL when lazy=false', () => {
    const getNode = new CommandChain(undefined, ProxyCommand.GET, 'myMethod', undefined, ctx);
    const result = generateProxyCommand(getNode, ProxyCommand.APPLY, undefined, ['arg1'], ctx, false);
    expect(result.type).toBe(ProxyCommand.APPLY);
  });

  it('should NOT collapse to METHOD_CALL when type is not APPLY', () => {
    const getNode = new CommandChain(undefined, ProxyCommand.GET, 'myMethod');
    const result = generateProxyCommand(getNode, ProxyCommand.GET, 'otherProp', undefined, ctx, true);
    expect(result.type).toBe(ProxyCommand.GET);
  });

  it('should NOT collapse to METHOD_CALL when prev is not GET', () => {
    const setNode = new CommandChain(undefined, ProxyCommand.SET, 'myProp');
    const result = generateProxyCommand(setNode, ProxyCommand.APPLY, undefined, [], ctx, true);
    expect(result.type).toBe(ProxyCommand.APPLY);
  });

  it('should create regular CommandChain for GET command', () => {
    const result = generateProxyCommand(undefined, ProxyCommand.GET, 'someProp', undefined, ctx, true);
    expect(result.type).toBe(ProxyCommand.GET);
    expect(result.name).toBe('someProp');
    expect(result.prev).toBeUndefined();
  });

  it('should chain commands correctly', () => {
    const firstNode = new CommandChain(undefined, ProxyCommand.GET, 'first', undefined, ctx);
    const result = generateProxyCommand(firstNode, ProxyCommand.GET, 'second', undefined, ctx, true);
    expect(result.type).toBe(ProxyCommand.GET);
    expect(result.name).toBe('second');
    expect(result.prev).toBe(firstNode);
  });
});

describe('getMethodName', () => {
  it('should return the name of the prev node', () => {
    const prevNode = new CommandChain(undefined, ProxyCommand.GET, 'targetMethod');
    const applyNode = new CommandChain(prevNode, ProxyCommand.APPLY);
    expect(getMethodName(applyNode)).toBe('targetMethod');
  });

  it('should return undefined when prev is not set', () => {
    const node = new CommandChain(undefined, ProxyCommand.APPLY);
    expect(getMethodName(node)).toBeUndefined();
  });
});

describe('getMethodCallContext', () => {
  it('should return the context of the prev node', () => {
    const ctx = Promise.resolve({}) as any;
    const prevNode = new CommandChain(undefined, ProxyCommand.GET, 'method', undefined, ctx);
    const applyNode = new CommandChain(prevNode, ProxyCommand.APPLY);
    expect(getMethodCallContext(applyNode)).toBe(ctx);
  });

  it('should return undefined when prev has no context', () => {
    const prevNode = new CommandChain(undefined, ProxyCommand.GET, 'method');
    const applyNode = new CommandChain(prevNode, ProxyCommand.APPLY);
    expect(getMethodCallContext(applyNode)).toBeUndefined();
  });
});
