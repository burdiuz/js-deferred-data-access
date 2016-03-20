'use strict';
var ResourceConverter = (function() {

  /**
   * @private
   */
  var FACTORY_FIELD = Symbol('resource.converter::factory');

  /**
   * @private
   */
  var REGISTRY_FIELD = Symbol('resource.converter::resourcePoolRegistry');

  /**
   * @private
   */
  var POOL_FIELD = Symbol('resource.converter::resourcePool');

  /**
   * @private
   */
  var ResourceConverterEvents = Object.freeze({
    RESOURCE_CREATED: 'resourceCreated',
    RESOURCE_CONVERTED: 'resourceConverted'
  });

  /**
   * @param {RequestFactory} factory
   * @param {ResourcePoolRegistry} registry
   * @param {ResourcePool} pool
   * @param {RequestHandlers} handlers
   * @extends EventDispatcher
   * @constructor
   */
  function ResourceConverter(factory, registry, pool, handlers) {
    this[FACTORY_FIELD] = factory;
    this[POOL_FIELD] = pool;
    this[REGISTRY_FIELD] = registry;
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
    } else {
      result = data;
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
    var result = data;
    var poolId;
    if (isResource(data)) {
      poolId = getResourcePoolId(data);
      if (this[REGISTRY_FIELD].isRegistered(poolId)) { // target object is stored in current pool
        var target = this[REGISTRY_FIELD].get(poolId).get(getResourceId(data));
        if (target) {
          result = target.resource;
        }
      } else { // target object has another origin, should be wrapped
        result = this[FACTORY_FIELD].create(Promise.resolve(data));
      }
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
      if (isResourceConvertible(data)) { // if data is RequestTarget, TargetResource, IConvertible, Function or RAW resource data
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

  function _lookupForPending(data) {
    var result = [];

    function add(value) {
      if (RequestTarget.isPending(value)) {
        result.push(value);
      }
      return value;
    }

    if (typeof(data) === 'object' && data !== null) {
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
   * @param {RequestFactory} factory
   * @param {ResourcePoolRegistry} registry
   * @param {ResourcePool} pool
   * @param {RequestHandlers} handlers
   * @returns {ResourceConverter}
   */
  function ResourceConverter_create(factory, registry, pool, handlers) {
    return new ResourceConverter(factory, registry, pool, handlers);
  }

  ResourceConverter.create = ResourceConverter_create;
  ResourceConverter.Events = ResourceConverterEvents;

  return ResourceConverter;
})();
