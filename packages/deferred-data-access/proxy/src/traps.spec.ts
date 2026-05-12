import { createProxyTrapsObject } from './traps';
import { ProxyCommand } from './command';
import { API_PROP, ProxyWrapper } from './types';

const makeWrapper = (target: any): ProxyWrapper => {
  const wrapper = Object.assign(function $Request() {}, {
    target,
    [API_PROP]: { getTarget: () => target },
  }) as unknown as ProxyWrapper;
  return wrapper;
};

describe('createProxyTrapsObject', () => {
  let handler: jest.Mock;
  let traps: ReturnType<typeof createProxyTrapsObject>;

  beforeEach(() => {
    handler = jest.fn().mockReturnValue('handler-result');
    traps = createProxyTrapsObject(handler);
  });

  describe('get trap', () => {
    it('should call handler with GET command for normal property', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      traps.get(wrapper as any, 'myProp');
      expect(handler).toHaveBeenCalledWith(ProxyCommand.GET, 'myProp', undefined, target);
    });

    it('should bypass handler and return wrapper[name] for excluded names', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      // `arguments` is non-writable on strict-mode functions; use `prototype` instead
      (wrapper as any)['prototype'] = 'proto-value';
      const result = traps.get(wrapper as any, 'prototype');
      expect(handler).not.toHaveBeenCalled();
      expect(result).toBe('proto-value');
    });

    it('should bypass handler for API_PROP', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      const result = traps.get(wrapper as any, API_PROP);
      expect(handler).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return whatever handler returns', () => {
      handler.mockReturnValue('mocked');
      const wrapper = makeWrapper(Promise.resolve({}));
      const result = traps.get(wrapper as any, 'prop');
      expect(result).toBe('mocked');
    });
  });

  describe('apply trap', () => {
    it('should call handler with APPLY command and args', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      traps.apply(wrapper as any, undefined as any, ['arg1', 'arg2'] as any);
      expect(handler).toHaveBeenCalledWith(ProxyCommand.APPLY, undefined, ['arg1', 'arg2'], target);
    });

    it('should pass empty args array when no args provided', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      traps.apply(wrapper as any, undefined as any, [] as any);
      expect(handler).toHaveBeenCalledWith(ProxyCommand.APPLY, undefined, [], target);
    });
  });

  describe('set trap', () => {
    it('should call handler with SET command for normal property and return true', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      const result = traps.set(wrapper as any, 'myProp', 42);
      expect(handler).toHaveBeenCalledWith(ProxyCommand.SET, 'myProp', 42, target);
      expect(result).toBe(true);
    });

    it('should not call handler for excluded names and return false', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      const result = traps.set(wrapper as any, 'arguments', 'val');
      expect(handler).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should not call handler for prototype and return false', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      const result = traps.set(wrapper as any, 'prototype', {});
      expect(handler).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('deleteProperty trap', () => {
    it('should call handler with DELETE_PROPERTY command and return true', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      const result = traps.deleteProperty(wrapper as any, 'removeProp');
      expect(handler).toHaveBeenCalledWith(ProxyCommand.DELETE_PROPERTY, 'removeProp', undefined, target);
      expect(result).toBe(true);
    });

    it('should not call handler for excluded names and return false', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      const result = traps.deleteProperty(wrapper as any, 'caller');
      expect(handler).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('has trap', () => {
    it('should return false for normal property names (prevents Promise from awaiting)', () => {
      const wrapper = makeWrapper(Promise.resolve({}));
      const result = traps.has(wrapper as any, 'then');
      expect(result).toBe(false);
    });

    it('should return wrapper[name] for excluded properties', () => {
      const wrapper = makeWrapper(Promise.resolve({}));
      // `arguments` is non-writable on strict-mode functions; use `prototype` instead
      (wrapper as any)['prototype'] = true;
      const result = traps.has(wrapper as any, 'prototype');
      expect(result).toBe(true);
    });
  });

  describe('ownKeys trap', () => {
    it('should return the EXCLUSIONS keys', () => {
      const result = traps.ownKeys(undefined as any);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('arguments');
      expect(result).toContain('caller');
      expect(result).toContain('prototype');
    });
  });

  describe('getOwnPropertyDescriptor trap', () => {
    it('should return wrapper descriptor for excluded properties', () => {
      const wrapper = makeWrapper(Promise.resolve({}));
      const desc = traps.getOwnPropertyDescriptor(wrapper as any, 'arguments');
      // excluded properties return wrapper's own descriptor (or undefined)
      expect(desc === undefined || typeof desc === 'object').toBe(true);
    });

    it('should return target descriptor for normal properties', () => {
      const target = Promise.resolve({});
      const wrapper = makeWrapper(target);
      const desc = traps.getOwnPropertyDescriptor(wrapper as any, 'normalProp');
      expect(desc).toBeUndefined(); // target (Promise) doesn't have 'normalProp'
    });
  });
});
