/**
 * Created by Oleg Galaburda on 07.03.16.
 */
/**
 */
var ResourceConverter = (function() {

  var FACTORY_FIELD = Symbol('resource.converter::factory');

  var POOL_FIELD = Symbol('resource.converter::resourcePool');

  var ResourceConverterEvents = Object.freeze({
    RESOURCE_CREATED: 'resourceCreated',
    RESOURCE_CONVERTED: 'resourceConverted'
  });

  /**
   * @param factory {RequestFactory}
   * @constructor
   * @extends EventDispatcher
   */
  function ResourceConverter(factory, pool, handlers) {
    this[FACTORY_FIELD] = factory;
    this[POOL_FIELD] = pool;
    EventDispatcher.apply(this);
    if (handlers) {
      handlers.setConverter(this);
    }
  }

  function _resourceToObject(data) {
    var result;
    if (isResourceConvertible(data)) {
      result = getRAWResource(data, this[POOL_FIELD]);
    } else if (typeof(data.toJSON) === 'function') {
      result = data.toJSON();
    }
    if (result !== data && this.hasEventListener(ResourceConverterEvents.RESOURCE_CONVERTED)) {
      this.dispatchEvent(ResourceConverterEvents.RESOURCE_CONVERTED, {
        data: data,
        result: result
      });
    }
    return result;
  }

  function _objectToResource(data) {
    var result;
    var poolId = getResourcePoolId(data);
    if (ResourcePoolRegistry.isRegistered(poolId)) { // target object is stored in current pool
      data = ResourcePoolRegistry.get(poolId).get(getResourceId(data));
      if (data) {
        result = data.resource;
      }
    } else { // target object has another origin, should be wrapped
      result = this[FACTORY_FIELD].create(Promise.resolve(data));
    }
    if (result !== data && this.hasEventListener(ResourceConverterEvents.RESOURCE_CREATED)) {
      this.dispatchEvent(ResourceConverterEvents.RESOURCE_CREATED, {
        data: data,
        result: result
      });
    }
    return result;
  }

  function _lookupArray(list, linkConvertHandler) {
    var result = [];
    var length = list.length;
    for (var index = 0; index < length; index++) {
      result[index] = linkConvertHandler.call(this, list[index]);
    }
    return result;
  }

  function _lookupObject(data, linkConvertHandler) {
    var result = {};
    for (var name in data) {
      if (!data.hasOwnProperty(name)) continue;
      result[name] = linkConvertHandler.call(this, data[name]);
    }
    return result;
  }

  function _toJSON(data) {
    var result = data;
    if (data !== undefined && data !== null) {
      if (isResourceConvertible(data)) { // if data is link
        result = this.resourceToObject(data);
      } else if (data instanceof Array) { // if data is Array of values, check its
        result = this.lookupArray(data, this.resourceToObject);
      } else if (data.constructor === Object) { // only Object instances can be looked up, other object types must be converted by hand
        result = this.lookupObject(data, this.resourceToObject);
      }
    }
    return result;
  }

  function _parse(data) {
    var result = data;
    if (data !== undefined && data !== null) {
      if (isResource(data)) { // if data is link
        result = this.objectToResource(data);
      } else if (data instanceof Array) { // if data is Array of values, check its
        result = this.lookupArray(data, this.objectToResource);
      } else if (data.constructor === Object) {
        result = this.lookupObject(data, this.objectToResource);
      }
    }
    return result;
  }

  function _lookupForPending(data) {
    var result = [];
    if (typeof(data) === 'object' && data !== null) {
      function add(value) {
        if (RequestTarget.isPending(value)) {
          result.push(value);
        }
        return value;
      }

      if (RequestTarget.isPending(data)) {
        result.push(data);
      } else if (data instanceof Array) {
        this.lookupArray(data, add);
      } else if (data.constructor === Object) {
        this.lookupObject(data, add);
      }
    }
    return result;
  }

  ResourceConverter.prototype = EventDispatcher.createNoInitPrototype();
  ResourceConverter.prototype.constructor = ResourceConverter;
  ResourceConverter.prototype.toJSON = _toJSON;
  ResourceConverter.prototype.parse = _parse;
  ResourceConverter.prototype.lookupArray = _lookupArray;
  ResourceConverter.prototype.lookupObject = _lookupObject;
  ResourceConverter.prototype.lookupForPending = _lookupForPending;
  ResourceConverter.prototype.resourceToObject = _resourceToObject;
  ResourceConverter.prototype.objectToResource = _objectToResource;

  //------------------------ static

  /**
   * @param factory {RequestFactory}
   * @param handlers {RequestHandlers}
   * @returns {ResourceConverter}
   */
  function ResourceConverter_create(factory, pool, handlers) {
    return new ResourceConverter(factory, pool, handlers);
  }

  ResourceConverter.create = ResourceConverter_create;
  ResourceConverter.Events = ResourceConverterEvents;

  return ResourceConverter;
})();
