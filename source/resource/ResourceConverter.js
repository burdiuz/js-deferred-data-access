import EventDispatcher from 'event-dispatcher';
import getResourcePoolId from '../utils/getResourcePoolId';
import getResourceId from '../utils/getResourceId';
import isResource from '../utils/isResource';
import isResourceConvertible from '../utils/isResourceConvertible';
import getRawResource from '../utils/getRawResource';
import { isPending, toJSON } from '../request/RequestTarget';

export const ResourceConverterEvents = Object.freeze({
  RESOURCE_CREATED: 'resourceCreated',
  RESOURCE_CONVERTED: 'resourceConverted',
});

/**
 * Resource converter contains bunch of methods to lookup for resources
 * and registering them, converting them into RAWResource or into
 * RequestTargets, depending on their origin.
 * Before sending data, bundled resources should be registered in ResourcePool
 * and then converted to RAWResource objects.
 * After data received, its RAWResources should be converted to RequestTargets
 * for not resolved resources or to resource target values otherwise.
 * Resource can be resolved by its `id` and `poolId`, if ResourceConverter
 * can find ResourcePool with id from poolId, it will try to get target
 * resource value and replace with it RAWResource object.
 * If ResourcePool not found, ResourceConverter assumes that resource come from
 * other origin/environment and creates RequestTarget object that can be target
 * object for commands.
 * ResourceConverter while handling data does not look deeply, so its developer
 * responsibility to convert deeply nested resource targets.
 * @param {RequestFactory} factory
 * @param {ResourcePoolRegistry} registry
 * @param {ResourcePool} pool
 * @param {RequestHandlers} handlers
 * @extends EventDispatcher
 */
class ResourceConverter extends EventDispatcher {
  constructor(factory, registry, pool, handlers = null) {
    super();
    this.factory = factory;
    this.pool = pool;
    this.registry = registry;

    if (handlers) {
      handlers.setConverter(this);
    }
  }

  resourceToObject(data) {
    let result;

    if (isResourceConvertible(data)) {
      result = getRawResource(data, this.pool);
    } else if (typeof data.toJSON === 'function') {
      result = data.toJSON();
    } else {
      return data;
    }

    if (this.hasEventListener(ResourceConverterEvents.RESOURCE_CONVERTED)) {
      this.dispatchEvent(ResourceConverterEvents.RESOURCE_CONVERTED, {
        data,
        result,
      });
    }

    return result;
  }

  /**
   * @method DataAccessInterface.ResourceConverter#objectToResource
   * @param {*} data
   * @returns {*}
   * @private
   */
  objectToResource(data) {
    let result = data;

    if (isResource(data)) {
      const poolId = getResourcePoolId(data);

      if (this.registry.isRegistered(poolId)) { // target object is stored in current pool
        const target = this.registry.get(poolId).get(getResourceId(data));

        if (target) {
          result = target.resource;
        }

      } else { // target object has another origin, should be wrapped
        result = this.factory.create(Promise.resolve(data));
      }
    }

    if (result !== data && this.hasEventListener(ResourceConverterEvents.RESOURCE_CREATED)) {
      this.dispatchEvent(ResourceConverterEvents.RESOURCE_CREATED, {
        data,
        result,
      });
    }

    return result;
  }

  /**
   * @method DataAccessInterface.ResourceConverter#lookupArray
   * @param list
   * @param linkConvertHandler
   * @returns {Array}
   * @private
   */
  lookupArray(list, linkConvertHandler) {
    const result = [];
    const { length } = list;
    for (let index = 0; index < length; index++) {
      // FIXME Array.map()
      result[index] = linkConvertHandler.call(this, list[index]);
    }
    return result;
  }

  /**
   * @method DataAccessInterface.ResourceConverter#lookupObject
   * @param {*} data
   * @param {Function} linkConvertHandler
   * @returns {*}
   * @private
   */
  lookupObject(data, linkConvertHandler) {
    const result = {};
    for (const name in data) {
      if (Object.prototype.hasOwnProperty.call(data, name)) {
        result[name] = linkConvertHandler.call(this, data[name]);
      }
    }
    return result;
  }

  /**
   * @method DataAccessInterface.ResourceConverter#toJSON
   * @param {*} data
   * @returns {*}
   * @private
   */
  toJSON(data) {
    let result = data;

    if (data !== undefined && data !== null) {
      if (isResourceConvertible(data)) {
        // if data is RequestTarget, TargetResource, IConvertible, Function or RAW resource data
        result = this.resourceToObject(data);
      } else if (data instanceof Array) {
        // if data is Array of values, check its
        result = this.lookupArray(data, this.resourceToObject);
      } else if (data.constructor === Object) {
        // only Object instances can be looked up, other object types must be converted by hand
        result = this.lookupObject(data, this.resourceToObject);
      }
    }
    return result;
  }

  /**
   * @method DataAccessInterface.ResourceConverter#parse
   * @param {*} data
   * @returns {*}
   * @private
   */
  parse(data) {
    let result = data;

    if (data !== undefined && data !== null) {
      if (isResource(data)) { // if data is RAW resource data
        result = this.objectToResource(data);
      } else if (data instanceof Array) { // if data is Array of values, check its
        result = this.lookupArray(data, this.objectToResource);
      } else if (data.constructor === Object) {
        result = this.lookupObject(data, this.objectToResource);
      }
    }

    return result;
  }

  /**
   * @method DataAccessInterface.ResourceConverter#lookupForPending
   * @param {*} data
   * @returns {Array}
   */
  lookupForPending(data) {
    const result = [];

    const add = (value) => {
      if (isPending(value)) {
        result.push(value);
      }
      return value;
    };

    if (typeof data === 'object' && data !== null) {
      if (isPending(data)) {
        result.push(data);
      } else if (data instanceof Array) {
        this.lookupArray(data, add);
      } else if (data.constructor === Object) {
        this.lookupObject(data, add);
      }
    }
    return result;
  }
}

/**
 * @param {RequestFactory} factory
 * @param {DataAccessInterface.ResourcePoolRegistry} registry
 * @param {DataAccessInterface.ResourcePool} pool
 * @param {RequestHandlers} handlers
 * @returns {ResourceConverter}
 */
export const createResourceConverter = (factory, registry, pool, handlers) => (
  new ResourceConverter(factory, registry, pool, handlers)
);

export default ResourceConverter;
