import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { IFinalizationRegistryConstructor } from '@actualwave/weak-storage';
import { ResourcePool } from './resource-pool';
import { Resource } from './resource';
import {
  setCustomFinalizationRegistryClass,
} from './finalization-registry';

describe('ResourcePool', () => {
  let pool: ResourcePool;

  beforeEach(() => {
    pool = new ResourcePool();
  });

  afterEach(() => {
    setCustomFinalizationRegistryClass(undefined);
  });

  describe('constructor', () => {
    it('should create a pool with an auto-generated id', () => {
      expect(typeof pool.id).toBe('string');
      expect(pool.id.length).toBeGreaterThan(0);
    });

    it('should create pools with unique ids', () => {
      const pool2 = new ResourcePool();
      expect(pool.id).not.toBe(pool2.id);
    });

    it('should have active=true when created', () => {
      expect(pool.active).toBe(true);
    });

    it('should use the custom FinalizationRegistryClass when none explicitly provided', () => {
      let instantiated = false;
      const MockRegistry = class {
        constructor(_cb: (key: unknown) => void) { instantiated = true; }
        register() {}
      } as unknown as IFinalizationRegistryConstructor;

      setCustomFinalizationRegistryClass(MockRegistry);
      new ResourcePool();
      expect(instantiated).toBe(true);
    });

    it('should use an explicitly provided FinalizationRegistryClass over the custom one', () => {
      let customUsed = false;
      let explicitUsed = false;
      const CustomRegistry = class {
        constructor() { customUsed = true; }
        register() {}
      } as unknown as IFinalizationRegistryConstructor;
      const ExplicitRegistry = class {
        constructor() { explicitUsed = true; }
        register() {}
      } as unknown as IFinalizationRegistryConstructor;

      setCustomFinalizationRegistryClass(CustomRegistry);
      new ResourcePool(ExplicitRegistry);
      expect(explicitUsed).toBe(true);
      expect(customUsed).toBe(false);
    });
  });

  describe('set', () => {
    it('should return a Resource for a valid object target', () => {
      const target = {};
      const resource = pool.set(target);
      expect(resource).toBeInstanceOf(Resource);
    });

    it('should return a Resource for a function target', () => {
      const target = () => {};
      const resource = pool.set(target);
      expect(resource).toBeInstanceOf(Resource);
    });

    it('should return null for invalid (primitive) targets', () => {
      const result = pool.set(42 as any);
      expect(result).toBeNull();
    });

    it('should return the same Resource if the target is set twice', () => {
      const target = {};
      const r1 = pool.set(target);
      const r2 = pool.set(target);
      expect(r1).toBe(r2);
    });

    it('should use provided type when given', () => {
      const target = {};
      const resource = pool.set(target, 'customType') as Resource;
      expect(resource.type).toBe('customType');
    });

    it('should store reference to pool on the resource', () => {
      const resource = pool.set({}) as Resource;
      expect(resource.pool).toBe(pool);
    });
  });

  describe('has', () => {
    it('should return false when target not in pool', () => {
      expect(pool.has({})).toBe(false);
    });

    it('should return true after setting a target', () => {
      const target = {};
      pool.set(target);
      expect(pool.has(target)).toBe(true);
    });

    it('should return false after removing the target', () => {
      const target = {};
      pool.set(target);
      pool.remove(target);
      expect(pool.has(target)).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve the original target by resource id object', () => {
      const target = { key: 'value' };
      const resource = pool.set(target) as Resource;
      const retrieved = pool.get(resource);
      expect(retrieved).toBe(target);
    });

    it('should return undefined for unknown id', () => {
      const result = pool.get({ id: 'nonexistent' });
      expect(result).toBeUndefined();
    });
  });

  describe('getById', () => {
    it('should retrieve the original target by resource id string', () => {
      const target = { key: 'value' };
      const resource = pool.set(target) as Resource;
      const retrieved = pool.getById(resource.id);
      expect(retrieved).toBe(target);
    });

    it('should return undefined for unknown id string', () => {
      expect(pool.getById('no-such-id')).toBeUndefined();
    });
  });

  describe('getResource', () => {
    it('should return the Resource instance for a known target', () => {
      const target = {};
      const resource = pool.set(target) as Resource;
      expect(pool.getResource(target)).toBe(resource);
    });

    it('should return undefined for unknown target', () => {
      expect(pool.getResource({})).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove a target from the pool and return true', () => {
      const target = {};
      pool.set(target);
      expect(pool.remove(target)).toBe(true);
      expect(pool.has(target)).toBe(false);
    });

    it('should return false when target was not in pool', () => {
      expect(pool.remove({})).toBe(false);
    });

    it('should make getById return undefined after removal', () => {
      const target = {};
      const resource = pool.set(target) as Resource;
      const id = resource.id;
      pool.remove(target);
      expect(pool.getById(id)).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should remove all entries from the pool', () => {
      const t1 = {};
      const t2 = () => {};
      pool.set(t1);
      pool.set(t2);
      pool.clear();
      expect(pool.has(t1)).toBe(false);
      expect(pool.has(t2)).toBe(false);
    });

    it('should not throw when pool is already empty', () => {
      expect(() => pool.clear()).not.toThrow();
    });
  });
});
