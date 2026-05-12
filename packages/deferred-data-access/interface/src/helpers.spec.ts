import { findEventEmitter, findMessagePort, createSubscriberFns } from './helpers';

describe('findEventEmitter', () => {
  it('should return the worker if provided', () => {
    const worker = { postMessage: jest.fn() };
    expect(findEventEmitter(worker)).toBe(worker);
  });

  it('should return self if no worker provided and self is defined', () => {
    // In Node/jest env, `self` may or may not be defined
    const result = typeof self === 'object'
      ? findEventEmitter(undefined)
      : null;

    if (result !== null) {
      expect(result).toBe(self);
    }
  });

  it('should throw if no worker and self is not defined', () => {
    // Simulate missing self by temporarily patching global
    const origSelf = (global as any).self;
    delete (global as any).self;

    expect(() => findEventEmitter(undefined)).toThrow(
      'EventEmitter is not defined'
    );

    (global as any).self = origSelf;
  });
});

describe('findMessagePort', () => {
  it('should return the worker if provided', () => {
    const port = { postMessage: jest.fn() };
    expect(findMessagePort(port)).toBe(port);
  });

  it('should throw if no worker and self is not defined', () => {
    const origSelf = (global as any).self;
    delete (global as any).self;

    expect(() => findMessagePort(undefined)).toThrow(
      'MessagePort is not defined'
    );

    (global as any).self = origSelf;
  });
});

describe('createSubscriberFns', () => {
  describe('addEventListener / removeEventListener', () => {
    it('should use addEventListener/removeEventListener when available', () => {
      const addEventListener = jest.fn();
      const removeEventListener = jest.fn();
      const instance = { addEventListener, removeEventListener };
      const { subscribe, unsubscribe } = createSubscriberFns(instance);
      const listener = jest.fn();

      subscribe(listener);
      expect(addEventListener).toHaveBeenCalledWith('message', listener);

      unsubscribe(listener);
      expect(removeEventListener).toHaveBeenCalledWith('message', listener);
    });

    it('should use custom eventType when provided', () => {
      const addEventListener = jest.fn();
      const removeEventListener = jest.fn();
      const instance = { addEventListener, removeEventListener };
      const { subscribe } = createSubscriberFns(instance, 'custom-event');
      subscribe(jest.fn());
      expect(addEventListener).toHaveBeenCalledWith('custom-event', expect.any(Function));
    });
  });

  describe('addListener / removeListener', () => {
    it('should use addListener/removeListener when available', () => {
      const addListener = jest.fn();
      const removeListener = jest.fn();
      const instance = { addListener, removeListener };
      const { subscribe, unsubscribe } = createSubscriberFns(instance);
      const listener = jest.fn();

      subscribe(listener);
      expect(addListener).toHaveBeenCalledWith('message', listener);

      unsubscribe(listener);
      expect(removeListener).toHaveBeenCalledWith('message', listener);
    });
  });

  describe('on / off', () => {
    it('should use on/off when available', () => {
      const on = jest.fn();
      const off = jest.fn();
      const instance = { on, off };
      const { subscribe, unsubscribe } = createSubscriberFns(instance);
      const listener = jest.fn();

      subscribe(listener);
      expect(on).toHaveBeenCalledWith('message', listener);

      unsubscribe(listener);
      expect(off).toHaveBeenCalledWith('message', listener);
    });
  });

  describe('error case', () => {
    it('should throw if instance has no known event methods', () => {
      const instance = {};
      expect(() => createSubscriberFns(instance)).toThrow(
        'Target does not implement EventEmitter insterface'
      );
    });
  });
});
