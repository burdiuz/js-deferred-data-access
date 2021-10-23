///<reference path="../../../typings/@actualwave/has-own/index.d.ts" />
import { IdOwner } from '@actualwave/deferred-data-access/utils';
import { hasOwn } from '@actualwave/has-own';
import { getDefaultResourcePool } from './default-resource-pool';
import { ResourcePool } from './resource-pool';

export class ResourcePoolRegistry extends IdOwner {
  private readonly pools: { [key: string]: ResourcePool } = {};

  constructor() {
    super();
    this.register(getDefaultResourcePool());
  }

  /**
   * Create and register ResourcePool
   */
  createPool() {
    const pool = new ResourcePool();
    this.register(pool);
    return pool;
  }

  /**
   * Register ResourcePool instance.
   */
  register(pool: ResourcePool): boolean {
    if (hasOwn(this.pools, pool.id)) return false;

    this.pools[pool.id] = pool;
    return true;
  }

  /**
   * Retrieve ResourcePool instance from registry by its Id.
   */
  get(poolId: string): ResourcePool | null {
    return this.pools[poolId] || null;
  }

  /**
   * Check if ResourcePool registered in this registry instance.
   */
  isRegistered(pool: ResourcePool): boolean {
    return hasOwn(this.pools, pool.id);
  }

  /**
   * Remove ResourcePool from current registry instance.
   */
  remove(pool: string | ResourcePool): boolean {
    const poolId = typeof pool === 'string' ? pool : pool.id;

    return delete this.pools[poolId];
  }
}

const generateGetRegistry =
  (registry?: ResourcePoolRegistry) => (): ResourcePoolRegistry => {
    if (!registry) {
      registry = new ResourcePoolRegistry();
    }

    return registry;
  };

  export const getRegistry = generateGetRegistry();