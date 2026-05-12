import { getDefaultResourcePool } from './default-resource-pool';
import { ResourcePool } from './resource-pool';

describe('getDefaultResourcePool', () => {
  it('should return a ResourcePool instance', () => {
    const pool = getDefaultResourcePool();
    expect(pool).toBeInstanceOf(ResourcePool);
  });

  it('should return the same singleton instance on every call', () => {
    const pool1 = getDefaultResourcePool();
    const pool2 = getDefaultResourcePool();
    expect(pool1).toBe(pool2);
  });

  it('should have a string id', () => {
    const pool = getDefaultResourcePool();
    expect(typeof pool.id).toBe('string');
  });

  it('should be active', () => {
    const pool = getDefaultResourcePool();
    expect(pool.active).toBe(true);
  });
});
