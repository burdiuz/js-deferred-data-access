import EventDispatcher from 'event-dispatcher';
import ResourcePool, {
  createResourcePool,
  ResourcePoolEvents,
  defaultResourcePool,
} from './ResourcePool';

export const PoolRegistryEvents = Object.freeze({
  RESOURCE_POOL_CREATED: 'resourcePoolCreated',
  RESOURCE_POOL_REGISTERED: 'resourcePoolRegistered',
  RESOURCE_POOL_REMOVED: 'resourcePoolRemoved',
});

const POOLS_FIELD = Symbol('resource.pool.registry::pools');

/**
 * @classdesc Collection of ResourcePool instances. Allows lookup for ResourcePool by its Id.
 * When ResourcePool is registered in PoolRegistry, it subscribes to
 * ResourcePool POOL_DESTROYED event and removes pool from registry after its destroyed.
 */
class PoolRegistry extends EventDispatcher {
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
   * @returns {DataAccessInterface.ResourcePool} New ResourcePool instance
   */
  createPool() {
    const pool = createResourcePool();
    if (this.hasEventListener(PoolRegistryEvents.RESOURCE_POOL_CREATED)) {
      this.dispatchEvent(PoolRegistryEvents.RESOURCE_POOL_CREATED, pool);
    }
    this.register(pool);
    return pool;
  }

  /**
   * Register ResourcePool instance.
   * @param pool {DataAccessInterface.ResourcePool} ResourcePool instance to be registered
   */
  register(pool) {
    if (Object.prototype.hasOwnProperty.call(this[POOLS_FIELD], pool.id)) return;
    this[POOLS_FIELD][pool.id] = pool;
    pool.addEventListener(ResourcePoolEvents.POOL_DESTROYED, this.handlePoolDestroyed);
    if (this.hasEventListener(PoolRegistryEvents.RESOURCE_POOL_REGISTERED)) {
      this.dispatchEvent(PoolRegistryEvents.RESOURCE_POOL_REGISTERED, pool);
    }
  }

  /**
   * Retrieve ResourcePool instance from registry by its Id.
   * @param poolId {String} ResourcePool instance Id
   * @returns {DataAccessInterface.ResourcePool|null}
   */
  get(poolId) {
    return this[POOLS_FIELD][poolId] || null;
  }

  /**
   * Check if ResourcePool registered in this registry instance.
   * @param pool {DataAccessInterface.ResourcePool|String} ResourcePool instance or its Id.
   * @returns {Boolean}
   */
  isRegistered(pool) {
    return Object.prototype.hasOwnProperty.call(
      this[POOLS_FIELD],
      pool instanceof ResourcePool ? pool.id : String(pool),
    );
  }

  /**
   * Remove ResourcePool from current registry instance.
   * @param pool {DataAccessInterface.ResourcePool|String} ResourcePool instance or its Id.
   * @returns {Boolean}
   */
  remove(pool) {
    let result = false;
    pool = pool instanceof ResourcePool ? pool : this.get(pool);
    if (pool) {
      pool.removeEventListener(ResourcePoolEvents.POOL_DESTROYED, this.handlePoolDestroyed);
      result = delete this[POOLS_FIELD][pool.id];
    }
    if (this.hasEventListener(PoolRegistryEvents.RESOURCE_POOL_REMOVED)) {
      this.dispatchEvent(PoolRegistryEvents.RESOURCE_POOL_REMOVED, pool);
    }
    return result;
  }

  static events = PoolRegistryEvents;
}

export const createPoolRegistry = () => new PoolRegistry();

export default PoolRegistry;
