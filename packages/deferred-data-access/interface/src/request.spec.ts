import { applyRemoteRequest, pool } from './request';
import { getRegistry } from '@actualwave/deferred-data-access/resource';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';
import { MessageType } from './utils';

const makeRequest = (overrides: Partial<any> = {}): any => ({
  id: 'req-1',
  type: MessageType.REQUEST,
  source: 'remote',
  target: 'local',
  command: { type: ProxyCommand.GET, name: 'myProp', value: undefined },
  context: undefined,
  ...overrides,
});

describe('pool', () => {
  it('should be a ResourcePool instance', () => {
    expect(pool).toBeDefined();
    expect(typeof pool.set).toBe('function');
    expect(typeof pool.has).toBe('function');
  });
});

describe('applyRemoteRequest', () => {
  it('should execute GET on a registered context object', () => {
    const target = { myProp: 'hello' };
    const resource = pool.set(target)!;
    const contextObj = resource.toObject();

    const result = applyRemoteRequest(makeRequest({
      command: { type: ProxyCommand.GET, name: 'myProp', value: undefined },
      context: contextObj,
    }));

    expect(result).toBe('hello');
  });

  it('should execute SET on a registered context object', () => {
    const target: any = { myProp: 'old' };
    const resource = pool.set(target)!;
    const contextObj = resource.toObject();

    applyRemoteRequest(makeRequest({
      command: { type: ProxyCommand.SET, name: 'myProp', value: 'new' },
      context: contextObj,
    }));

    expect(target.myProp).toBe('new');
  });

  it('should execute DELETE_PROPERTY on a registered context object', () => {
    const target: any = { removable: true };
    const resource = pool.set(target)!;
    const contextObj = resource.toObject();

    applyRemoteRequest(makeRequest({
      command: { type: ProxyCommand.DELETE_PROPERTY, name: 'removable', value: undefined },
      context: contextObj,
    }));

    expect(target.hasOwnProperty('removable')).toBe(false);
  });

  it('should execute METHOD_CALL on a registered context object', () => {
    const target = {
      double: (n: number) => n * 2,
    };
    const resource = pool.set(target)!;
    const contextObj = resource.toObject();

    const result = applyRemoteRequest(makeRequest({
      command: { type: ProxyCommand.METHOD_CALL, name: 'double', value: [5] },
      context: contextObj,
    }));

    expect(result).toBe(10);
  });

  it('should execute APPLY on a registered function context', () => {
    const fn = jest.fn().mockReturnValue('applied');
    const resource = pool.set(fn)!;
    const contextObj = resource.toObject();

    const result = applyRemoteRequest(makeRequest({
      command: { type: ProxyCommand.APPLY, name: undefined, value: [undefined, ['x', 'y']] },
      context: contextObj,
    }));

    expect(result).toBe('applied');
    expect(fn).toHaveBeenCalledWith('x', 'y');
  });

  it('should throw if context resource does not exist', () => {
    expect(() =>
      applyRemoteRequest(makeRequest({
        command: { type: ProxyCommand.GET, name: 'foo', value: undefined },
        context: { id: 'nonexistent', poolId: pool.id, type: 'object' },
      }))
    ).toThrow('Resource "nonexistent" does not exist');
  });

  it('should throw if pool does not exist', () => {
    expect(() =>
      applyRemoteRequest(makeRequest({
        command: { type: ProxyCommand.GET, name: 'foo', value: undefined },
        context: { id: 'any', poolId: 'bad-pool-id', type: 'object' },
      }))
    ).toThrow('Resource Pool "bad-pool-id" does not exist');
  });

  it('should wrap function return values as ResourceObjects', () => {
    const innerFn = () => {};
    const target = { getInner: () => innerFn };
    const resource = pool.set(target)!;
    const contextObj = resource.toObject();

    const result = applyRemoteRequest(makeRequest({
      command: { type: ProxyCommand.METHOD_CALL, name: 'getInner', value: [] },
      context: contextObj,
    })) as any;

    expect(typeof result.id).toBe('string');
    expect(typeof result.poolId).toBe('string');
  });
});
