/**
 * @exports DataAccessInterface
 */

import areProxiesAvailable from '../../shared-utils/areProxiesAvailable';
import isResource from './utils/isResource';
import getResourcePoolId from './utils/getResourcePoolId';
import getResourceId from './utils/getResourceId';
import createForeignResource from './utils/createForeignResource';
import { createHandlers } from './request/Handlers';
import { createProxyFactory } from './request/ProxyFactory';
import { createRequestFactory } from './request/Factory';
import { defaultResourcePool, ResourcePoolEvents } from './resource/ResourcePool';
import { createResourceConverter } from './resource/Converter';
import { createPoolRegistry } from './resource/PoolRegistry';

class DataAccessInterface {

  /**
   * @class DataAccessInterface
   * @classdesc Facade of Deferred Data Access library, it holds all
   * of public API -- objects like ResourcePool and methods to work
   * with resources.
   * @param {Descriptor[]|Object.<string, Function|Descriptor>} descriptors
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

    this.handlers = createHandlers(proxyEnabled);

    if (proxyEnabled) {
      this.factory = createProxyFactory(this.handlers, this.cache);
    } else {
      this.factory = createRequestFactory(this.handlers, this.cache);
    }

    if (!this.poolRegistry) {
      this.poolRegistry = createPoolRegistry();
    }

    if (this.pool) {
      this.poolRegistry.register(this.pool);
    } else if (this.pool !== undefined) {
      this.pool = this.poolRegistry.createPool();
    } else {
      this.pool = defaultResourcePool;
    }

    this.resourceConverter = createResourceConverter(
      this.factory,
      this.poolRegistry,
      this.pool,
      this.handlers,
    );

    const poolDestroyedHandler = () => {
      this.pool.removeEventListener(ResourcePoolEvents.POOL_DESTROYED, poolDestroyedHandler);
      this.pool = this.poolRegistry.createPool();
      this.pool.addEventListener(ResourcePoolEvents.POOL_DESTROYED, poolDestroyedHandler);
    };

    this.handlers.setCommands(descriptors);
    this.pool.addEventListener(ResourcePoolEvents.POOL_DESTROYED, poolDestroyedHandler);
  }

  get proxyEnabled() {
    return this.handlers.proxyEnabled;
  }

  send(command, args, target = null) {
    return
  }

  parse(data) {
    return this.resourceConverter.parse(data);
  }

  dummy() {
    return this.parse(createForeignResource());
  };

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

export const create = (handlers, proxyEnabled = true, poolRegistry = null, pool = null, cacheImpl = null) =>
  new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);

export default DataAccessInterface;

