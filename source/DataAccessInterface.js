/**
 * @exports DataAccessInterface
 */

import { areProxiesAvailable } from './utils';
import {
  createRequestHandlers,
  createRequestProxyFactory,
  createRequestFactory,
} from './request';
import {
  createResourceConverter,
  createResourcePoolRegistry,
  ResourcePoolEvents,
} from './resource';
import {
  defaultResourcePool,
  isResource,
  getResourcePoolId,
  getResourceId,
} from './resource/utils';

class DataAccessInterface {

  /**
   * @class DataAccessInterface
   * @classdesc Facade of Deferred Data Access library, it holds all
   * of public API -- objects like ResourcePool and methods to work
   * with resources.
   * @param {CommandDescriptor[]|Object.<string, Function|CommandDescriptor>} descriptors
   * @param {boolean} [proxyEnabled=false]
   * @param {ResourcePoolRegistry} [poolRegistry]
   * @param {ResourcePool} [pool]
   * @param {ICacheImpl} [cacheImpl]
   */
  constructor(
    descriptors,
    proxyEnabled = true,
    poolRegistry = null,
    pool = null,
    cacheImpl = null,
  ) {
    this.poolRegistry = poolRegistry;
    this.pool = pool;
    this.cache = cacheImpl;
    this.initialize(descriptors, proxyEnabled);
  }

  initialize(descriptors, proxyEnabled) {
    if (proxyEnabled && !areProxiesAvailable()) {
      throw new Error('Proxies are not available in this environment');
    }

    this.handlers = createRequestHandlers(proxyEnabled);
    this.resourceConverter = createResourceConverter(
      this.factory,
      this.poolRegistry,
      this.pool,
      this.handlers,
    );

    if (proxyEnabled) {
      this.factory = createRequestProxyFactory(this.handlers, this.cache);
    } else {
      this.factory = createRequestFactory(this.handlers, this.cache);
    }

    if (!this.poolRegistry) {
      this.poolRegistry = createResourcePoolRegistry();
    }

    if (this.pool) {
      this.poolRegistry.register(this.pool);
    } else if (this.pool !== undefined) {
      this.pool = this.poolRegistry.createPool();
    } else {
      this.pool = defaultResourcePool;
    }

    const poolDestroyedHandler = () => {
      this.pool.removeEventListener(ResourcePoolEvents.POOL_DESTROYED, poolDestroyedHandler);
      this.pool = this.poolRegistry.createPool();
      this.pool.addEventListener(ResourcePoolEvents.POOL_DESTROYED, poolDestroyedHandler);
    };

    this.handlers.setHandlers(descriptors);
    this.pool.addEventListener(ResourcePoolEvents.POOL_DESTROYED, poolDestroyedHandler);
  }

  get proxyEnabled() {
    return this.handlers.proxyEnabled;
  }

  parse(data) {
    return this.resourceConverter.parse(data);
  }

  toJSON(data) {
    return this.resourceConverter.toJSON(data);
  }

  isOwnResource(resource) {
    /**
     * @type {DataAccessInterface.ResourcePool}
     */
    let pool;
    if (isResource(resource)) {
      pool = this.poolRegistry.get(getResourcePoolId(resource));
      return pool && pool.has(getResourceId(resource));
    }
    return false;
  }
}

export const create = (handlers, proxyEnabled, poolRegistry, pool, cacheImpl) =>
  new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);

export const dummy = (handlers, proxyEnabled, poolRegistry, pool, cacheImpl) => {
  const api = new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);
  return api.parse(handlers());
};

export default DataAccessInterface;

