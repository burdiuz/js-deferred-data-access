/**
 * Created by Oleg Galaburda on 07.03.16.
 */
//TODO If RequestTarget, RequestTargetLink or their proxies are passed, they should be converted to RAW links.
/**
 * @type _ResourceConverter
 */
var ResourceConverter = (function() {
  //FIXME might be better names for these events
  var ResourceConverterEvents = {
    RESOURCE_CREATED: 'resourceCreated',
    RESOURCE_CONVERTED: 'resourceConverted'
  };

  function _resourceToObject(data) {
    var result;
    if (isResourceConvertible(data)) {
      //INFO this will never be executed with Proxies because Proxy target is wrapper function,
      // so `proxy instanceof RequestTarget` will give false
      result = getRAWResource(data);
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

  function _objectToResource(data, requestHandlers) {
    var result;
    var poolId = getResourcePoolId(data);
    if (TargetPoolRegistry.isRegistered(poolId)) { // target object is stored in current pool
      data = TargetPoolRegistry.get(poolId).get(getResourceId(data));
      if (data) {
        result = data.resource;
      }
    } else { // target object has another origin, should be wrapped
      result = new RequestTarget(Promise.resolve(data), requestHandlers);
    }
    if (result !== data && this.hasEventListener(ResourceConverterEvents.RESOURCE_CREATED)) {
      this.dispatchEvent(ResourceConverterEvents.RESOURCE_CREATED, {
        data: data,
        result: result
      });
    }
    return result;
  }

  function _lookupArray(list, linkConvertHandler, requestHandlers) {
    var result = [];
    var length = list.length;
    for (var index = 0; index < length; index++) {
      result[index] = linkConvertHandler.call(this, list[index], requestHandlers);
    }
    return result;
  }

  function _lookupObject(data, linkConvertHandler, requestHandlers) {
    var result = {};
    for (var name in data) {
      if (!data.hasOwnProperty(name)) continue;
      result[name] = linkConvertHandler.call(this, data[name], requestHandlers);
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

  function _parse(data, requestHandlers) {
    var result = data;
    if (data !== undefined && data !== null) {
      if (isResource(data)) { // if data is link
        result = this.objectToResource(data, requestHandlers);
      } else if (data instanceof Array) { // if data is Array of values, check its
        result = this.lookupArray(data, this.objectToResource, requestHandlers);
      } else if (data.constructor === Object) {
        result = this.lookupObject(data, this.objectToResource, requestHandlers);
      }
    }
    return result;
  }

  /* these methods are WorkerInterface-specific and should be removed from this project
   function _prepareToSend(data) {
   if (data) {
   data.value = this.toJSON(data.value);
   }
   return data;
   }

   function _prepareToReceive(data, requestHandlers) {
   if (data) {
   data.value = this.parse(data.value, requestHandlers);
   }
   return data;
   }

   ResourceConverter.prototype.prepareToSend = _prepareToSend;
   ResourceConverter.prototype.prepareToReceive = _prepareToReceive;

   */

  /**
   * @constructor
   * @extends EventDispatcher
   * @private
   */
  function _ResourceConverter() {
    EventDispatcher.apply(this);
  }

  _ResourceConverter.prototype = EventDispatcher.createNoInitPrototype();
  _ResourceConverter.prototype.constructor = _ResourceConverter;
  _ResourceConverter.prototype.toJSON = _toJSON;
  _ResourceConverter.prototype.parse = _parse;
  _ResourceConverter.prototype.lookupArray = _lookupArray;
  _ResourceConverter.prototype.lookupObject = _lookupObject;
  _ResourceConverter.prototype.resourceToObject = _resourceToObject;
  _ResourceConverter.prototype.objectToResource = _objectToResource;

  return new _ResourceConverter();
})();
