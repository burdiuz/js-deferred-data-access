import { Command } from './command';

describe('Command', () => {
  describe('constructor', () => {
    it('should create a command with type only', () => {
      const cmd = new Command('P:get');
      expect(cmd.type).toBe('P:get');
      expect(cmd.name).toBeUndefined();
      expect(cmd.value).toBeUndefined();
      expect(cmd.context).toBeUndefined();
    });

    it('should create a command with all properties', () => {
      const ctx = Promise.resolve({});
      const cmd = new Command('P:set', 'myProp', 42, ctx);
      expect(cmd.type).toBe('P:set');
      expect(cmd.name).toBe('myProp');
      expect(cmd.value).toBe(42);
      expect(cmd.context).toBe(ctx);
    });

    it('should create a command with symbol name', () => {
      const sym = Symbol('test');
      const cmd = new Command('P:get', sym);
      expect(cmd.name).toBe(sym);
    });
  });

  describe('toObject', () => {
    it('should return an object without context by default', () => {
      const ctx = Promise.resolve({});
      const cmd = new Command('P:get', 'foo', 'bar', ctx);
      const obj = cmd.toObject();
      expect(obj.type).toBe('P:get');
      expect(obj.name).toBe('foo');
      expect(obj.value).toBe('bar');
      expect(obj.context).toBeUndefined();
    });

    it('should include context when includeContext is true', () => {
      const ctx = Promise.resolve({});
      const cmd = new Command('P:get', 'foo', 'bar', ctx);
      const obj = cmd.toObject(true);
      expect(obj.context).toBe(ctx);
    });

    it('should return correct shape for minimal command', () => {
      const cmd = new Command('P:apply');
      const obj = cmd.toObject();
      expect(obj).toHaveProperty('type', 'P:apply');
      expect(obj).toHaveProperty('name');
      expect(obj).toHaveProperty('value');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON string without context by default', () => {
      const cmd = new Command('P:get', 'propName', 123);
      const json = cmd.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed[0]).toBe('P:get');
      expect(parsed[1]).toBe('propName');
      expect(parsed[2]).toBe(123);
      expect(parsed[3]).toBeUndefined();
    });

    it('should serialize to JSON string with context when flag is true', () => {
      const ctx = Promise.resolve({});
      const cmd = new Command('P:get', 'propName', 123, ctx);
      const json = cmd.toJSON(true);
      const parsed = JSON.parse(json);
      // context is a Promise - it serializes to {}
      expect(parsed).toHaveLength(4);
    });

    it('should produce valid JSON', () => {
      const cmd = new Command('P:set', 'key', { nested: true });
      expect(() => JSON.parse(cmd.toJSON())).not.toThrow();
    });

    it('should produce a 3-element array when includeContext is false', () => {
      const cmd = new Command('P:get', 'n', 1, Promise.resolve({}));
      const parsed = JSON.parse(cmd.toJSON());
      expect(parsed).toHaveLength(3);
    });
  });

  describe('fromJSON', () => {
    it('should reconstruct a Command from JSON string', () => {
      const original = new Command('P:get', 'testProp', [1, 2, 3]);
      const json = original.toJSON();
      const restored = Command.fromJSON(json);
      expect(restored.type).toBe('P:get');
      expect(restored.name).toBe('testProp');
      expect(restored.value).toEqual([1, 2, 3]);
    });

    it('should handle null values gracefully', () => {
      const json = JSON.stringify(['P:del', null, null, null]);
      const cmd = Command.fromJSON(json);
      expect(cmd.type).toBe('P:del');
      expect(cmd.name).toBeNull();
      expect(cmd.value).toBeNull();
    });

    it('should round-trip type and value correctly', () => {
      const cmd = new Command('P:apply', undefined, ['arg1', 'arg2']);
      const restored = Command.fromJSON(cmd.toJSON());
      expect(restored.type).toBe(cmd.type);
      expect(restored.value).toEqual(['arg1', 'arg2']);
    });

    it('should handle a 3-element JSON array (no context element)', () => {
      const json = JSON.stringify(['P:get', 'prop', 'val']);
      const cmd = Command.fromJSON(json);
      expect(cmd.type).toBe('P:get');
      expect(cmd.name).toBe('prop');
      expect(cmd.value).toBe('val');
      expect(cmd.context).toBeUndefined();
    });
  });

  describe('immutability', () => {
    it('should have readonly type', () => {
      const cmd = new Command('P:get');
      expect(() => {
        // @ts-expect-error testing readonly
        cmd.type = 'P:set';
      }).toThrow();
    });

    it('should have readonly name', () => {
      const cmd = new Command('P:get', 'foo');
      expect(() => {
        // @ts-expect-error testing readonly
        cmd.name = 'bar';
      }).toThrow();
    });
  });
});
