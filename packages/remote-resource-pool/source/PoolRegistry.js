import EventDispatcher from '@actualwave/event-dispatcher';
import hasOwnProperty from 'shared-utils/hasOwnProperty';
import createResourcePool from './createResourcePool';
import defaultResourcePool from './defaultResourcePool';
import ResourcePool from './ResourcePool';

const POOLS_FIELD = Symbol('resource.pool.registry::pools');

/**
 * @classdesc Collection of ResourcePool instances. Allows lookup for ResourcePool by its Id.
 * When ResourcePool is registered in PoolRegistry, it subscribes to
 * ResourcePool POOL_DESTROYED event and removes pool from registry after its destroyed.
 */
class PoolRegistry extends EventDispatcher {
  static RESOURCE_POOL_CREATED = 'resourcePoolCreated';
  static RESOURCE_POOL_REGISTERED = 'resourcePoolRegistered';
  static RESOURCE_POOL_REMOVED = 'resourcePoolRemoved';
  constructor() {
    super();
    this[POOLS_FIELD] = {};

    // every registry should keep default pool, so you can have access from anywhere
    this.register(defaultResourcePool);
  }

  handlePoolDestroyed = (event) => {
    this.remove(event.data);
  }

  /**
   * Create and register ResourcePool
   * @returns {ResourcePool} New ResourcePool instance
   */
  createPool() {
    const pool = createResourcePool();
    if (this.hasEventListener(PoolRegistry.RESOURCE_POOL_CREATED)) {
      this.dispatchEvent(PoolRegistry.RESOURCE_POOL_CREATED, pool);
    }
    this.register(pool);
    return pool;
  }

  /**
   * Register ResourcePool instance.
   * @param pool {ResourcePool} ResourcePool instance to be registered
   */
  register(pool) {
    if (hasOwnProperty(this[POOLS_FIELD], pool.id)) return;
    this[POOLS_FIELD][pool.id] = pool;
    pool.addEventListener(ResourcePool.POOL_DESTROYED, this.handlePoolDestroyed);
    if (this.hasEventListener(PoolRegistry.RESOURCE_POOL_REGISTERED)) {
      this.dispatchEvent(PoolRegistry.RESOURCE_POOL_REGISTERED, pool);
    }
  }

  /**
   * Retrieve ResourcePool instance from registry by its Id.
   * @param poolId {String} ResourcePool instance Id
   * @returns {ResourcePool|null}
   */
  get(poolId) {
    return this[POOLS_FIELD][poolId] || null;
  }

  /**
   * Check if ResourcePool registered in this registry instance.
   * @param pool {ResourcePool|String} ResourcePool instance or its Id.
   * @returns {Boolean}
   */
  isRegistered(pool) {
    return hasOwnProperty(
      this[POOLS_FIELD],
      pool instanceof ResourcePool ? pool.id : String(pool),
    );
  }

  /**
   * Remove ResourcePool from current registry instance.
   * @param pool {ResourcePool|String} ResourcePool instance or its Id.
   * @returns {Boolean}
   */
  remove(pool) {
    let result = false;
    pool = pool instanceof ResourcePool ? pool : this.get(pool);
    if (pool) {
      pool.removeEventListener(ResourcePool.POOL_DESTROYED, this.handlePoolDestroyed);
      result = delete this[POOLS_FIELD][pool.id];
    }
    if (this.hasEventListener(PoolRegistry.RESOURCE_POOL_REMOVED)) {
      this.dispatchEvent(PoolRegistry.RESOURCE_POOL_REMOVED, pool);
    }
    return result;
  }
}

export default PoolRegistry;
