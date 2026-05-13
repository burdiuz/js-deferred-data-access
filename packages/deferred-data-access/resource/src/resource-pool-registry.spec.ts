import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ResourcePoolRegistry, getRegistry, setRegistry } from './resource-pool-registry';
import { ResourcePool } from './resource-pool';
import { getDefaultResourcePool } from './default-resource-pool';

describe('ResourcePoolRegistry', () => {
  let registry: ResourcePoolRegistry;

  beforeEach(() => {
    registry = new ResourcePoolRegistry();
  });

  describe('constructor', () => {
    it('should create a registry with an auto-generated id', () => {
      expect(typeof registry.id).toBe('string');
    });

    it('should auto-register the default resource pool', () => {
      const defaultPool = getDefaultResourcePool();
      expect(registry.isRegistered(defaultPool)).toBe(true);
    });
  });

  describe('createPool', () => {
    it('should create and return a new ResourcePool', () => {
      const pool = registry.createPool();
      expect(pool).toBeInstanceOf(ResourcePool);
    });

    it('should auto-register the created pool', () => {
      const pool = registry.createPool();
      expect(registry.isRegistered(pool)).toBe(true);
    });

    it('should create pools with unique ids', () => {
      const p1 = registry.createPool();
      const p2 = registry.createPool();
      expect(p1.id).not.toBe(p2.id);
    });
  });

  describe('register', () => {
    it('should register an external pool and return true', () => {
      const pool = new ResourcePool();
      expect(registry.register(pool)).toBe(true);
      expect(registry.isRegistered(pool)).toBe(true);
    });

    it('should return false if the same pool is registered twice', () => {
      const pool = new ResourcePool();
      registry.register(pool);
      expect(registry.register(pool)).toBe(false);
    });
  });

  describe('get', () => {
    it('should return the registered pool by id', () => {
      const pool = registry.createPool();
      expect(registry.get(pool.id)).toBe(pool);
    });

    it('should return null for unknown pool id', () => {
      expect(registry.get('nonexistent-id')).toBeNull();
    });

    it('should return the default pool by id', () => {
      const defaultPool = getDefaultResourcePool();
      expect(registry.get(defaultPool.id)).toBe(defaultPool);
    });
  });

  describe('isRegistered', () => {
    it('should return true for a registered pool', () => {
      const pool = registry.createPool();
      expect(registry.isRegistered(pool)).toBe(true);
    });

    it('should return false for a pool not in this registry', () => {
      const pool = new ResourcePool(); // not registered
      expect(registry.isRegistered(pool)).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove a pool by pool instance', () => {
      const pool = registry.createPool();
      const removed = registry.remove(pool);
      expect(removed).toBe(true);
      expect(registry.get(pool.id)).toBeNull();
    });

    it('should remove a pool by pool id string', () => {
      const pool = registry.createPool();
      registry.remove(pool.id);
      expect(registry.get(pool.id)).toBeNull();
    });

    it('should return true even for non-existent ids (delete behavior)', () => {
      // JS delete returns true even if key didn't exist
      expect(registry.remove('nonexistent-id')).toBe(true);
    });
  });
});

describe('getRegistry / setRegistry', () => {
  const original = getRegistry();

  afterEach(() => {
    setRegistry(original);
  });

  it('should return a ResourcePoolRegistry instance', () => {
    expect(getRegistry()).toBeInstanceOf(ResourcePoolRegistry);
  });

  it('should return the same singleton on every call', () => {
    expect(getRegistry()).toBe(getRegistry());
  });

  it('should return the replacement after setRegistry', () => {
    const replacement = new ResourcePoolRegistry();
    setRegistry(replacement);
    expect(getRegistry()).toBe(replacement);
  });

  it('should restore the original when set back', () => {
    setRegistry(new ResourcePoolRegistry());
    setRegistry(original);
    expect(getRegistry()).toBe(original);
  });
});
