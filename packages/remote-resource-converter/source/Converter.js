import EventDispatcher from '@actualwave/event-dispatcher';
import hasOwnProperty from '../utils/hasOwnProperty';
import getResourcePoolId from '../utils/getResourcePoolId';
import getResourceId from '../utils/getResourceId';
import isResource from '../utils/isResource';
import isResourceConvertible from '../utils/isResourceConvertible';
import getRawResource from '../utils/getRawResource';
import isPending from '../request/target/isPending';

/**
 * Resource converter contains bunch of methods to lookup for resources
 * and registering them, converting them into RAWResource or into
 * Targets, depending on their origin.
 * Before sending data, bundled resources should be registered in ResourcePool
 * and then converted to RAWResource objects.
 * After data received, its RAWResources should be converted to Targets
 * for not resolved resources or to resource target values otherwise.
 * Resource can be resolved by its `id` and `poolId`, if Converter
 * can find ResourcePool with id from poolId, it will try to get target
 * resource value and replace with it RAWResource object.
 * If ResourcePool not found, Converter assumes that resource come from
 * other origin/environment and creates Target object that can be target
 * object for commands.
 * Converter while handling data does not look deeply, so its developer
 * responsibility to convert deeply nested resource targets.
 */
class Converter extends EventDispatcher {
  static RESOURCE_CREATED = 'resourceCreated';
  static RESOURCE_CONVERTED = 'resourceConverted';
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

    if (this.hasEventListener(Converter.RESOURCE_CONVERTED)) {
      this.dispatchEvent(Converter.RESOURCE_CONVERTED, {
        data,
        result,
      });
    }

    return result;
  }

  /**
   * @method ResourceConverter#objectToResource
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
          result = target.value;
        }

      } else { // target object has another origin, should be wrapped
        result = this.factory.create(Promise.resolve(data));
      }
    }

    if (result !== data && this.hasEventListener(Converter.RESOURCE_CREATED)) {
      this.dispatchEvent(Converter.RESOURCE_CREATED, {
        data,
        result,
      });
    }

    return result;
  }

  /**
   * @method ResourceConverter#lookupArray
   * @param list
   * @param linkConvertHandler
   * @returns {Array}
   * @private
   */
  lookupArray(list, linkConvertHandler) {
    return list.map((item) => linkConvertHandler.call(this, item));
  }

  /**
   * @method ResourceConverter#lookupObject
   * @param {*} data
   * @param {Function} linkConvertHandler
   * @returns {*}
   * @private
   */
  lookupObject(data, linkConvertHandler) {
    return Object.getOwnPropertyNames(data)
      .reduce((result, name) => {
        if (hasOwnProperty(data, name)) {
          result[name] = linkConvertHandler.call(this, data[name]);
        }

        return result;
      }, {});
  }

  /**
   * @method ResourceConverter#toJSON
   * @param {*} data
   * @returns {*}
   * @private
   */
  toJSON(data) {
    let result = data;

    if (data !== undefined && data !== null) {
      if (isResourceConvertible(data)) {
        // if data is Target, Resource, IConvertible, Function or RAW resource data
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
   * @method ResourceConverter#parse
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
   * @method ResourceConverter#lookupForPending
   * @param {*} data
   * @returns {Array}
   */
  // FIXME for now data is always array
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
 * @param {ResourcePoolRegistry} registry
 * @param {ResourcePool} pool
 * @param {Handlers} handlers
 * @returns {ResourceConverter}
 */
export const createResourceConverter = (factory, registry, pool, handlers) => (
  new Converter(factory, registry, pool, handlers)
);

export default Converter;