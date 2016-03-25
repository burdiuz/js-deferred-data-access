// Uses Node, AMD or browser globals to create a module.
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.DataAccessInterface = factory();
  }
}(this, function() {
  var EventDispatcher = (function() {
    /**
     * Created by Oleg Galaburda on 09.02.16.
     */
    
    var Event = (function() {
    
      function toJSON() {
        return {type: this.type, data: this.data};
      }
    
      function Event(type, data) {
        var _defaultPrevented = false;
    
        function isDefaultPrevented() {
          return _defaultPrevented;
        }
    
        function preventDefault() {
          _defaultPrevented = true;
        }
    
        Object.defineProperties(this, {
          type: {
            value: type,
            enumerable: true
          },
          data: {
            value: data || null,
            enumerable: true
          }
        });
        this.preventDefault = preventDefault;
        this.isDefaultPrevented = isDefaultPrevented;
      }
    
      Event.prototype.toJSON = toJSON;
    
      return Event;
    })();
    
    var EventListeners = (function() {
      function add(eventType, handler, priority) {
        var handlers = createList(eventType, priority, this._listeners);
        if (handlers.indexOf(handler) < 0) {
          handlers.push(handler);
        }
      }
    
      function has(eventType) {
        var result = false;
        var priorities = getHashByKey(eventType, this._listeners);
        if (priorities) {
          for (var priority in priorities) {
            if (priorities.hasOwnProperty(priority)) {
              result = true;
              break;
            }
          }
        }
        return result;
      }
    
      function remove(eventType, handler) {
        var priorities = getHashByKey(eventType, this._listeners);
        if (priorities) {
          var list = Object.getOwnPropertyNames(priorities);
          var length = list.length;
          for (var index = 0; index < length; index++) {
            var priority = list[index];
            var handlers = priorities[priority];
            var handlerIndex = handlers.indexOf(handler);
            if (handlerIndex >= 0) {
              handlers.splice(handlerIndex, 1);
              if (!handlers.length) {
                delete priorities[priority];
              }
            }
          }
        }
      }
    
      function removeAll(eventType) {
        delete this._listeners[eventType];
      }
    
      function call(event, target) {
        var _stopped = false;
        var _immediatelyStopped = false;
    
        function stopPropagation() {
          _stopped = true;
        }
    
        function stopImmediatePropagation() {
          _immediatelyStopped = true;
        }
    
        /*
         * Three ways to implement this
         * 1. As its now -- just assign and delete after event cycle finished
         * 2. Use EventDispatcher.setupOptional()
         * 3. In this method create function StoppableEvent that will extend from this event and add these functions,
         *    then instantiate it for this one cycle.
         */
        event.stopPropagation = stopPropagation;
        event.stopImmediatePropagation = stopImmediatePropagation;
        /*
         var rmStopPropagation = EventDispatcher.setupOptional(event, 'stopPropagation', stopPropagation);
         var rmStopImmediatePropagation = EventDispatcher.setupOptional(event, 'stopImmediatePropagation', stopImmediatePropagation);
         */
        var priorities = getHashByKey(event.type, this._listeners);
        if (priorities) {
          var list = Object.getOwnPropertyNames(priorities).sort(function(a, b) {
            return a - b;
          });
          var length = list.length;
          for (var index = 0; index < length; index++) {
            if (_stopped) break;
            var handlers = priorities[list[index]];
            var handlersLength = handlers.length;
            for (var handlersIndex = 0; handlersIndex < handlersLength; handlersIndex++) {
              if (_immediatelyStopped) break;
              var handler = handlers[handlersIndex];
              handler.call(target, event);
            }
          }
        }
        delete event.stopPropagation;
        delete event.stopImmediatePropagation;
        /*
         rmStopPropagation();
         rmStopImmediatePropagation();
         */
      }
    
      function createList(eventType, priority, target) {
        var priorities = getHashByKey(eventType, target, Object);
        return getHashByKey(parseInt(priority), priorities, Array);
      }
    
      function getHashByKey(key, target, definition) {
        var value = null;
        if (target.hasOwnProperty(key)) {
          value = target[key];
        } else if (definition) {
          value = target[key] = new definition();
        }
        return value;
      }
    
      function EventListeners() {
        /**
         * key - event Type
         * value - hash of priorities
         *    key - priority
         *    value - list of handlers
         * @type {Object<string, Object.<string, Array<number, Function>>>}
         * @private
         */
        this._listeners = {};
      }
    
      EventListeners.prototype.add = add;
      EventListeners.prototype.has = has;
      EventListeners.prototype.remove = remove;
      EventListeners.prototype.removeAll = removeAll;
      EventListeners.prototype.call = call;
    
      return EventListeners;
    })();
    
    var EVENTDISPATCHER_NOINIT = {};
    
    /**
     *
     * @param eventPreprocessor {?Function}
     * @constructor
     */
    var EventDispatcher = (function() {
    
      var LISTENERS_FIELD = Symbol('event.dispatcher::listeners');
    
      var PREPROCESSOR_FIELD = Symbol('event.dispatcher::preprocessor');
    
      function EventDispatcher(eventPreprocessor) {
        if (eventPreprocessor === EVENTDISPATCHER_NOINIT) {
          // create noinit prototype
          return;
        }
        /**
         * @type {EventListeners}
         */
        Object.defineProperty(this, LISTENERS_FIELD, {
          value: new EventListeners()
        });
        Object.defineProperty(this, PREPROCESSOR_FIELD, {
          value: eventPreprocessor
        });
      }
    
    
      function _addEventListener(eventType, listener, priority) {
        this[LISTENERS_FIELD].add(eventType, listener, -priority || 0);
      }
    
      function _hasEventListener(eventType) {
        return this[LISTENERS_FIELD].has(eventType);
      }
    
      function _removeEventListener(eventType, listener) {
        this[LISTENERS_FIELD].remove(eventType, listener);
      }
    
      function _removeAllEventListeners(eventType) {
        this[LISTENERS_FIELD].removeAll(eventType);
      }
    
      function _dispatchEvent(event, data) {
        var eventObject = EventDispatcher.getEvent(event, data);
        if (this[PREPROCESSOR_FIELD]) {
          eventObject = this[PREPROCESSOR_FIELD].call(this, eventObject);
        }
        this[LISTENERS_FIELD].call(eventObject);
      }
    
      EventDispatcher.prototype.addEventListener = _addEventListener;
      EventDispatcher.prototype.hasEventListener = _hasEventListener;
      EventDispatcher.prototype.removeEventListener = _removeEventListener;
      EventDispatcher.prototype.removeAllEventListeners = _removeAllEventListeners;
      EventDispatcher.prototype.dispatchEvent = _dispatchEvent;
    
      function EventDispatcher_isObject(value) {
        return (typeof value === 'object') && (value !== null);
      }
    
      function EventDispatcher_getEvent(eventOrType, optionalData) {
        var event = eventOrType;
        if (!EventDispatcher.isObject(eventOrType)) {
          event = new EventDispatcher.Event(String(eventOrType), optionalData);
        }
        return event;
      }
    
      function EventDispatcher_create(eventPreprocessor) {
        return new EventDispatcher(eventPreprocessor);
      }
    
      function EventDispatcher_createNoInitPrototype() {
        return new EventDispatcher(EVENTDISPATCHER_NOINIT);
      }
    
      /*
       function setupOptional(target, name, value) {
       var cleaner = null;
       if (name in target) {
       cleaner = function() {
       };
       } else {
       target[name] = value;
       cleaner = function() {
       delete target[name];
       };
       }
       return cleaner;
       }
       EventDispatcher.setupOptional = setupOptional;
       */
    
      EventDispatcher.isObject = EventDispatcher_isObject;
    
      EventDispatcher.getEvent = EventDispatcher_getEvent;
      EventDispatcher.create = EventDispatcher_create;
      EventDispatcher.createNoInitPrototype = EventDispatcher_createNoInitPrototype;
      EventDispatcher.Event = Event;
      return EventDispatcher;
    })();
    
    return EventDispatcher;
  })();
  // here should be injected deferred-data-access.js content
  'use strict';
  var TargetStatus = Object.freeze({
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
    DESTROYED: 'destroyed'
  });
  
  
  var TARGET_INTERNALS = Symbol('request.target:internals');
  var TARGET_DATA = 'resource::data';
  
  var getId = (function() {
    var _base = 'DA/' + String(Date.now()) + '/';
    var _index = 0;
    return function() {
      return _base + String(++_index) + '/' + String(Date.now());
    };
  })();
  
  
  
  var Deferred = (function() {
  
    /**
     * @constructor
     */
    function Deferred() {
      this._status = TargetStatus.PENDING;
      this.promise = new Promise(function(resolve, reject) {
        this._resolveHandler = resolve;
        this._rejectHandler = reject;
      }.bind(this));
      Object.defineProperties(this, {
        status: {
          get: get_status
        }
      });
    }
  
    function get_status() {
      return this._status;
    }
  
    function _resolve() {
      var result = this._resolveHandler.apply(null, arguments);
      // changing status later will keep same it in case of Promise internal error
      this._status = TargetStatus.RESOLVED;
      return result;
    }
  
    function _reject() {
      var result = this._rejectHandler.apply(null, arguments);
      this._status = TargetStatus.REJECTED;
      return result;
    }
  
    Deferred.prototype.resolve = _resolve;
    Deferred.prototype.reject = _reject;
  
    return Deferred;
  })();
  
  /**
   * @returns {Deferred}
   */
  function createDeferred() {
    return new Deferred();
  }
  
  function areProxiesAvailable() {
    return typeof(Proxy) === 'function';
  }
  
  /**
   * Interface for all resource types, these will be treated as resources automatically
   * @constructor
   */
  function IConvertible() {
  
  }
  
  function getRAWResource(object, pool) {
    pool = pool || ResourcePoolRegistry.defaultResourcePool;
    var data = null;
    if (object instanceof TargetResource) {
      data = object.toJSON();
    } else if (typeof(object[TARGET_INTERNALS]) === 'object') {
      data = RequestTarget.toJSON(object);
    } else if (object instanceof IConvertible || typeof(object) === 'function') {
      data = pool.set(object).toJSON();
    } else if (isResource(object)) {
      data = object;
    }
    return data;
  }
  
  function getResourceData(object) {
    var data = getRAWResource(object);
    return data ? data[TARGET_DATA] : null;
  }
  
  function getResourceId(object) {
    var id = null;
    //if (object instanceof TargetResource || object instanceof RequestTarget) {
    if (typeof(object[TARGET_INTERNALS]) === 'object') {
      id = object[TARGET_INTERNALS].id;
    } else if (isResource(object)) {
      id = object[TARGET_DATA].id;
    }
    return id;
  }
  
  function getResourcePoolId(object) {
    var poolId = null;
    if (typeof(object[TARGET_INTERNALS]) === 'object') {
      poolId = object[TARGET_INTERNALS].poolId;
    } else if (isResource(object)) {
      poolId = object[TARGET_DATA].poolId;
    }
    return poolId;
  }
  
  function getResourceType(object) {
    var type = null;
    if (typeof(object[TARGET_INTERNALS]) === 'object') {
      type = object[TARGET_INTERNALS].type;
    } else if (isResource(object)) {
      type = object[TARGET_DATA].type;
    }
    return type;
  }
  
  function isResource(object) {
    return object instanceof TargetResource ||
      object instanceof RequestTarget ||
      (object && (
        // this case for RequestTargets and TargetResources which contain data in TARGET_INTERNALS Symbol
        // We check for their types above but in cases when Proxies are enabled their type will be Function
        // and verification will come to this case
        typeof(object[TARGET_INTERNALS]) === 'object' ||
          // this case for RAW resources passed via JSON conversion, look like {'resource::data': {id: '1111', poolId: '22222'}}
        typeof(object[TARGET_DATA]) === 'object'
      ));
  }
  
  function isResourceConvertible(data) {
    return isResource(data) || typeof(data) === 'function' || data instanceof IConvertible;
  }
  
  'use strict';
  var TargetResource = (function() {
    /**
     * The object that can be used to send Target to other side
     * @constructor
     */
    function TargetResource(_pool, _resource, resourceType, _id) {
      Object.defineProperty(this, TARGET_INTERNALS, { // private read-only property
        value: {
          active: true,
          pool: _pool,
          poolId: _pool ? _pool.id : null,
          resource: _resource,
          type: resourceType,
          id: _id
        }
      });
      Object.defineProperty(this, TARGET_DATA, {
        get: get_TARGET_DATA
      });
  
      Object.defineProperties(this, {
        active: {
          get: get_active
        },
        poolId: {
          get: get_poolId
        },
        resource: {
          get: get_resource
        },
        type: {
          get: get_type
        },
        id: {
          get: get_id
        }
      });
    }
  
    function get_TARGET_DATA() {
      return this.toJSON();
    }
  
    function get_active() {
      return Boolean(this[TARGET_INTERNALS].active);
    }
  
    function get_poolId() {
      return this[TARGET_INTERNALS].poolId;
    }
  
    function get_resource() {
      return this[TARGET_INTERNALS].resource;
    }
  
    function get_type() {
      return this[TARGET_INTERNALS].type || typeof(this[TARGET_INTERNALS].resource);
    }
  
    function get_id() {
      return this[TARGET_INTERNALS].id;
    }
  
    function _toJSON() {
      var data = {};
      data[TARGET_DATA] = {
        id: this[TARGET_INTERNALS].id,
        type: this.type,
        poolId: this.poolId
      };
      return data;
    }
  
    function _destroy() {
      var id = this[TARGET_INTERNALS].id;
      var pool = this[TARGET_INTERNALS].pool;
  
      if (!this[TARGET_INTERNALS].active) {
        return;
      }
      this[TARGET_INTERNALS].active = false;
  
      pool.remove(id);
  
      for (var name in this[TARGET_INTERNALS]) {
        delete this[TARGET_INTERNALS][name];
      }
    }
  
    TargetResource.prototype.toJSON = _toJSON;
    TargetResource.prototype.destroy = _destroy;
  
    function TargetResource_create(pool, target, targetType, id) {
      return new TargetResource(pool, target, targetType, id || getId());
    }
  
    TargetResource.create = TargetResource_create;
  
    return TargetResource;
  })();
  
  //=include target-pool.js
  //=include target-pool-registry.js
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
  
  'use strict';
  var RequestHandlers = (function() {
  
    var RequestHandlersEvents = Object.freeze({
      HANDLERS_UPDATED: 'handlersUpdated'
    });
  
    /**
     * @constructor
     */
    function RequestHandlers(proxyEnabled) {
      var _keys = [];
      var _descriptors = {};
      var _converter;
  
      proxyEnabled = Boolean(proxyEnabled);
  
      Object.defineProperties(this, {
        proxyEnabled: {
          value: proxyEnabled
        },
        available: {
          get: function() {
            return Boolean(_keys.length);
          }
        }
      });
  
      function _setConverter(converter) {
        _converter = converter;
      }
  
      function _setHandlers(handlers) {
        _descriptors = {};
        RequestHandlers.filterHandlers(handlers, _descriptors);
        _keys = Object.getOwnPropertyNames(_descriptors).concat(Object.getOwnPropertySymbols(_descriptors));
        if (proxyEnabled) {
          RequestHandlers.areProxyHandlersAvailable(_descriptors, true);
        }
      }
  
      function _hasHandler(type) {
        return _descriptors.hasOwnProperty(type);
      }
  
      function _getHandlers() {
        return _descriptors;
      }
  
      function _getHandlerNames() {
        return _keys.slice();
      }
  
      function _getHandler(type) {
        return _descriptors[type] || null;
      }
  
      function _handle(resource, name, pack, deferred) {
        var list = _converter ? _converter.lookupForPending(pack.value) : null;
        if (list && list.length) {
          // FIXME Need to test on all platforms: In other browsers this might not work because may need list of Promise objects, not RequestTargets
          Promise.all(list).then(function() {
            _handleImmediately(resource, name, pack, deferred);
          });
        } else {
          _handleImmediately(resource, name, pack, deferred);
        }
      }
  
      function _handleImmediately(resource, name, data, deferred) {
        var handler = _getHandler(name);
        if (handler instanceof CommandDescriptor) {
          //INFO result should be applied to deferred.resolve() or deferred.reject()
          handler.handle(resource, data, deferred);
        } else {
          throw new Error('Command descriptor for "' + name + '" was not found.');
        }
  
      }
  
      this.setConverter = _setConverter;
      /**
       * @param {Array<Number, CommandDescriptor>, Object<String, Function|CommandDescriptor>} handlers
       */
      this.setHandlers = _setHandlers;
      this.hasHandler = _hasHandler;
      this.getHandlers = _getHandlers;
      this.getHandlerNames = _getHandlerNames;
      this.getHandler = _getHandler;
      this.handle = _handle;
      this[Symbol.iterator] = function() {
        return new RequestHandlersIterator(this.getHandlers(), this.getHandlerNames());
      };
    }
  
    function RequestHandlersIterator(_data, _keys) {
      var _length = _keys.length;
      var _index = -1;
  
      function _next() {
        var result;
        if (++_index >= _length) {
          result = {done: true};
        } else {
          result = {value: _data[_keys[_index]], done: false};
        }
        return result;
      }
  
      this.next = _next;
      this[Symbol.iterator] = function() {
        return this;
      }.bind(this);
    }
  
    //------------------- static
  
    var RequestHandlers_filterHandlers = (function() {
      /**
       * @param {Array} handlers
       * @param {Object} descriptors
       * @returns {void}
       */
      function filterArray(handlers, descriptors) {
        var length = handlers.length;
        for (var index = 0; index < length; index++) {
          var value = handlers[index];
          if (value instanceof CommandDescriptor) {
            applyDescriptor(value, descriptors);
          }
        }
      }
  
      /**
       * @param {Object} handlers
       * @param {Object} descriptors
       * @returns {void}
       */
      function filterHash(handlers, descriptors) {
        if(!handlers) return;
        var keys = Object.getOwnPropertyNames(handlers).concat(Object.getOwnPropertySymbols(handlers));
        var length = keys.length;
        for (var index = 0; index < length; index++) {
          var name = keys[index];
          var value = handlers[name];
          if (typeof(value) === 'function') {
            value = CommandDescriptor.create(name, value);
          }
          if (value instanceof CommandDescriptor) {
            applyDescriptor(value, descriptors);
          }
        }
      }
  
      /**
       * Checks for CommandDescriptor uniqueness and reserved words usage.
       * @param {CommandDescriptor} descriptor
       * @param descriptors
       */
      function applyDescriptor(descriptor, descriptors) {
        var name = descriptor.name;
        var type = descriptor.type;
        if (type in Reserved.commands) {
          throw new Error('Command "' + type + '" is reserved and cannot be used in descriptor.');
        }
        if (name in Reserved.names) {
          throw new Error('Name "' + name + '" is reserved and cannot be used in descriptor.');
        }
        if (descriptors.hasOwnProperty(name) && descriptors[name] instanceof CommandDescriptor) {
          throw new Error('Field names should be unique, "' + String(name) + '" field has duplicates.');
        }
        descriptors[name] = descriptor;
      }
  
      /**
       *
       * @param {Array|Object} handlers
       * @param {Object<String, CommandDescriptor>} descriptors
       * @returns {void}
       */
      function RequestHandlers_filterHandlers(handlers, descriptors) {
        if (handlers instanceof Array) {
          filterArray(handlers, descriptors);
        } else {
          filterHash(handlers, descriptors);
        }
      }
  
      return RequestHandlers_filterHandlers;
    })();
  
    /**
     * @returns {RequestHandlers}
     */
    function RequestHandlers_create(proxyEnabled) {
      return new RequestHandlers(proxyEnabled);
    }
  
    function RequestHandlers_areProxyHandlersAvailable(handlers, throwError) {
      var result = true;
      var list = ProxyCommands.required;
      var length = list.length;
      for (var index = 0; index < length; index++) {
        var name = list[index];
        if (!(ProxyCommands.fields[name] in handlers)) {
          result = false;
          if (throwError) {
            throw new Error('For Proxy interface, handler "' + name + '" should be set.');
          }
        }
      }
      return result;
    }
  
    RequestHandlers.filterHandlers = RequestHandlers_filterHandlers;
    RequestHandlers.areProxyHandlersAvailable = RequestHandlers_areProxyHandlersAvailable;
    RequestHandlers.create = RequestHandlers_create;
    RequestHandlers.Events = RequestHandlersEvents;
    return RequestHandlers;
  })
  ();
  
  'use strict';
  var RequestTargetDecorator = (function() {
  
    /**
     *
     * @param handlers {RequestHandlers}
     * @constructor
     */
    function RequestTargetDecorator(_factory, _handlers) {
      var _members = new Map();
  
      function _getMember(propertyName, commandType, isTemporary) {
  
        function _commandHandler(command, value) {
          var result;
          var promise;
          var error = false;
          if (this[TARGET_INTERNALS]) {
            promise = this[TARGET_INTERNALS].sendRequest(propertyName, commandType, command, value);
            if (promise) {
              promise.then(function(data) {
                RequestTarget.setTemporary(result, Boolean(isTemporary(result, data, command, value)));
              });
            } else {
              promise = Promise.reject(new Error('Initial request failed and didn\'t result in promise.'));
              error = true;
            }
          } else {
            promise = Promise.reject(new Error('Target object is not a resource, so cannot be used for calls.'));
            error = true;
          }
          result = _factory.create(promise);
          if (!error) {
            this[TARGET_INTERNALS].registerChild(result);
          }
          return result;
        }
  
        if (!_members.has(propertyName)) {
          _members.set(propertyName, _commandHandler);
        }
        return _members.get(propertyName);
      }
  
      function _apply(request) {
        if (!_handlers.available) return;
        /* FIXME revert change when ES6 will be supported widely
         for (var descriptor of _handlers) {
         request[descriptor.name] = _getMember(descriptor.name, descriptor.type);
         }
         */
        var iterator = _handlers[Symbol.iterator]();
        var result;
        while (!(result = iterator.next()).done) {
          var descriptor = result.value;
          request[descriptor.name] = _getMember(descriptor.name, descriptor.type, descriptor.isTemporary);
        }
        return request;
      }
  
      this.apply = _apply;
    }
  
    //------------------- static
  
    /**
     * @param handlers {RequestHandlers}
     * @returns {RequestTargetDecorator}
     * @constructor
     */
    function RequestTargetDecorator_create(factory, handlers) {
      return new RequestTargetDecorator(factory, handlers);
    }
  
    RequestTargetDecorator.create = RequestTargetDecorator_create;
  
    return RequestTargetDecorator;
  })();
  
  
  'use strict';
  var FACTORY_DECORATOR_FIELD = Symbol('request.factory::decorator');
  
  var FACTORY_HANDLERS_FIELD = Symbol('request.factory::handlers');
  
  var RequestFactory = (function() {
    var NOINIT = {};
  
    function RequestFactory(handlers) {
      if (handlers === NOINIT) {
        return;
      }
      this[FACTORY_HANDLERS_FIELD] = handlers;
      this[FACTORY_DECORATOR_FIELD] = RequestTargetDecorator.create(this, handlers);
    }
  
    function _create(promise) {
      var request = RequestTarget.create(promise, this[FACTORY_HANDLERS_FIELD]);
      if (this[FACTORY_HANDLERS_FIELD].available) {
        this[FACTORY_DECORATOR_FIELD].apply(request);
      }
      return request;
    }
  
    RequestFactory.prototype.create = _create;
  
    //------------------- static
  
    function RequestFactory_create(handlers) {
      return new RequestFactory(handlers);
    }
  
    function RequestFactory_createNoInitPrototype() {
      return new RequestFactory(NOINIT);
    }
  
    RequestFactory.create = RequestFactory_create;
  
    RequestFactory.createNoInitProtoype = RequestFactory_createNoInitPrototype;
  
    return RequestFactory;
  })();
  
  'use strict';
  var RequestTargetInternals = (function() {
  
    /**
     *
     * @param _requestTarget {RequestTarget}
     * @param _promise {Promise}
     * @param _requestHandlers {RequestHandlers}
     * @constructor
     */
    function RequestTargetInternals(_requestTarget, _promise, _requestHandlers) {
      this.requestHandlers = _requestHandlers;
      this.requestTarget = _requestTarget;
      this.link = {};
      //INFO this should be not initialized i.e. keep it undefined, this will be checked later
      this.temporary;
      this.hadChildPromises = false;
      this.status = TargetStatus.PENDING;
      this.queue = [];
      this.children = [];
      this._deferred = createDeferred();
      this.promise = this._deferred.promise;
  
      Object.defineProperties(this, {
        poolId: {
          get: get_poolId
        },
        type: {
          get: get_type
        },
        id: {
          get: get_id
        }
      });
  
      _promise.then(
        _resolveHandler.bind(this),
        _rejectHandler.bind(this)
      );
    }
  
    function get_poolId() {
      return this.link.poolId || null;
    }
  
    function get_type() {
      return this.link.type || null;
    }
  
    function get_id() {
      return this.link.id || null;
    }
  
    function _resolveHandler(value) {
      this.status = TargetStatus.RESOLVED;
      if (isResource(value)) {
        this.link = getResourceData(value);
        //INFO Sending "this" as result of resolve() handler, causes infinite loop of this.then(), so I've used wrapper object
        //FIXME Check if Proxy wrapper will work with promise result, probably not
        value = {target: this.requestTarget};
        this._sendQueue();
        //In theory, at time of these lines executing, "temporary" property should be already set via _commandHandler() set from RequestTargetDecorator
        if (this.temporary) {
          this.destroy();
        }
      } else { // else { value must be passed as is }
        this._rejectQueue('Target of the call is not a resource and call cannot be sent.');
      }
      this._deferred.resolve(value);
      delete this._deferred;
    }
  
    function _rejectHandler(value) {
      this.status = TargetStatus.REJECTED;
      this._rejectQueue('Target of the call was rejected and call cannot be sent.');
      this._deferred.reject(value);
      delete this._deferred;
    }
  
    function _sendQueue() {
      while (this.queue && this.queue.length) {
        var request = this.queue.shift();
        var name = request[0];
        var pack = request[1];
        var deferred = request[2];
        pack.target = this.link.id;
        this._handleRequest(name, pack, deferred);
      }
      this.queue = null;
    }
  
    function _rejectQueue(message) {
      var error = new Error(message || 'This request was rejected before sending.');
      while (this.queue && this.queue.length) {
        /**
         * @type {[string, {type:string, cmd:string, value:*, target:string}, Deferred]}
         */
        var request = this.queue.shift();
        request[2].reject(error);
      }
      this.queue = null;
    }
  
    function _sendRequest(name, type, cmd, value) {
      var promise = null;
      if (this.requestHandlers.hasHandler(name)) {
        var pack = RequestTargetInternals.createRequestPackage(type, cmd, value, this.id);
        promise = this._applyRequest(name, pack, createDeferred());
      } else {
        throw new Error('Request handler of type "' + type + '" is not registered.');
      }
      return promise;
    }
  
    function _addToQueue(name, pack, deferred) {
      this.queue.push([name, pack, deferred]);
    }
  
  
    function _applyRequest(name, pack, deferred) {
      var promise = deferred.promise;
      switch (this.status) {
        case TargetStatus.PENDING:
          this._addToQueue(name, pack, deferred);
          break;
        case TargetStatus.REJECTED:
          promise = Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
          break;
        case TargetStatus.DESTROYED:
          promise = Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
          break;
        case TargetStatus.RESOLVED:
          this._handleRequest(name, pack, deferred);
          break;
      }
      return promise;
    }
  
    function _handleRequest(name, pack, deferred) {
      this.requestHandlers.handle(this.requestTarget, name, pack, deferred);
    }
  
    function _registerChild(childRequestTarget) {
      var handler = _onChildHandled.bind(this, childRequestTarget);
      var promise = RequestTarget.getRawPromise(childRequestTarget);
      this.children.push(childRequestTarget);
      promise.then(handler, handler);
    }
  
    function _onChildHandled(childRequestTarget) {
      if (this.children) {
        var index = this.children.indexOf(childRequestTarget);
        if (index >= 0) {
          this.children.splice(index, 1);
        }
      }
    }
  
  
    function _isActive() {
      return this.status === TargetStatus.PENDING || this.status === TargetStatus.RESOLVED;
    }
  
    function _canBeDestroyed() {
      return this.status === TargetStatus.RESOLVED || this.status === TargetStatus.REJECTED;
    }
  
    function _destroy() {
      var promise = null;
      if (this.canBeDestroyed()) {
        //INFO I should not clear children list, since they are pending and requests already sent.
        if (this.status === TargetStatus.RESOLVED) {
          promise = this.sendRequest(RequestTargetCommands.DESTROY, RequestTargetCommands.DESTROY);
        } else {
          promise = Promise.resolve();
        }
        this.status = TargetStatus.DESTROYED;
      } else {
        promise = Promise.reject(new Error('Invalid or already destroyed target.'));
      }
      return promise;
    }
  
    function _then() {
      var child = this.promise.then.apply(this.promise, arguments);
      if (child) {
        this.hadChildPromises = true;
      }
      return child;
    }
  
    function _catch() {
      var child = this.promise.catch.apply(this.promise, arguments);
      if (child) {
        this.hadChildPromises = true;
      }
      return child;
    }
  
    function _toJSON() {
      var data = {};
      data[TARGET_DATA] = {
        id: this.link.id,
        type: this.link.type,
        poolId: this.link.poolId
      };
      return data;
    }
  
    RequestTargetInternals.prototype._sendQueue = _sendQueue;
    RequestTargetInternals.prototype._rejectQueue = _rejectQueue;
    RequestTargetInternals.prototype.sendRequest = _sendRequest;
    RequestTargetInternals.prototype._addToQueue = _addToQueue;
    RequestTargetInternals.prototype._applyRequest = _applyRequest;
    RequestTargetInternals.prototype._handleRequest = _handleRequest;
    RequestTargetInternals.prototype.registerChild = _registerChild;
    RequestTargetInternals.prototype.isActive = _isActive;
    RequestTargetInternals.prototype.canBeDestroyed = _canBeDestroyed;
    RequestTargetInternals.prototype.destroy = _destroy;
    RequestTargetInternals.prototype.then = _then;
    RequestTargetInternals.prototype.catch = _catch;
    RequestTargetInternals.prototype.toJSON = _toJSON;
  
    //----------- static
  
    function _createRequestPackage(type, cmd, value, targetId) {
      return {
        type: type,
        cmd: cmd,
        value: value,
        target: targetId
      };
    }
  
    RequestTargetInternals.createRequestPackage = _createRequestPackage;
  
    return RequestTargetInternals;
  })();
  
  'use strict';
  var RequestTarget = (function() {
  
    var PROMISE_FIELD = Symbol('request.target::promise');
  
    /**
     * The object that will be available on other side
     * @param _promise {Promise}
     * @param _requestHandlers {RequestHandlers}
     * @constructor
     */
    function RequestTarget(_promise, _requestHandlers) {
      var promiseHandler;
      Object.defineProperty(this, TARGET_INTERNALS, {
        value: new RequestTargetInternals(this, _promise, _requestHandlers),
        configurable: true
      });
      promiseHandler = _promiseResolutionHandler.bind(this, _promise);
      _promise.then(promiseHandler, promiseHandler);
    }
  
    function _promiseResolutionHandler(_promise, data) {
      if (!isResource(data)) {
        this[PROMISE_FIELD] = _promise;
        delete this[TARGET_INTERNALS];
      }
    }
  
    function _then() {
      var target = this[TARGET_INTERNALS] || this[PROMISE_FIELD];
      target.then.apply(target, arguments);
    }
  
    function _catch() {
      var target = this[TARGET_INTERNALS] || this[PROMISE_FIELD];
      target.catch.apply(target, arguments);
    }
  
    RequestTarget.prototype.then = _then;
    RequestTarget.prototype.catch = _catch;
  
    //------------- static
    function RequestTarget_isActive(target) {
      return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].isActive() : false;
    }
  
    function RequestTarget_canBeDestroyed(target) {
      return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].canBeDestroyed() : false;
    }
  
    function RequestTarget_destroy(target) {
      return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].destroy() : null;
    }
  
    function RequestTarget_toJSON(target) {
      return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].toJSON() : null;
    }
  
    function RequestTarget_isPending(value) {
      return RequestTarget_getStatus(value) == TargetStatus.PENDING;
    }
  
    function RequestTarget_isTemporary(target) {
      return target && target[TARGET_INTERNALS] && target[TARGET_INTERNALS].temporary;
    }
  
    function RequestTarget_setTemporary(target, value) {
      if (target && target[TARGET_INTERNALS]) {
        target[TARGET_INTERNALS].temporary = Boolean(value);
      }
    }
  
    function RequestTarget_getStatus(target) {
      return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].status : null;
    }
  
    function RequestTarget_getQueueLength(target) {
      return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].queue.length : 0;
    }
  
    function RequestTarget_getQueueCommands(target) {
      var length;
      var result = [];
      var queue = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].queue : null;
      if (queue) {
        length = queue.length;
        for (var index = 0; index < length; index++) {
          result.push(queue[index][0].type);
        }
      }
      return result;
    }
  
    function RequestTarget_hadChildPromises(target) {
      return Boolean(target && target[TARGET_INTERNALS] && target[TARGET_INTERNALS].hadChildPromises);
    }
  
    function RequestTarget_getRawPromise(target) {
      return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].promise : null;
    }
  
    function RequestTarget_getChildren(target) {
      var list = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].children : null;
      return list ? list.slice() : [];
    }
  
    function RequestTarget_getChildrenCount(target) {
      var list = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].children : null;
      return list ? list.length : 0;
    }
  
    /**
     *
     * @param promise {Promise}
     * @param requestHandlers {RequestHandlers}
     * @returns {RequestTarget}
     * @constructor
     */
    function RequestTarget_create(promise, requestHandlers) {
      return new RequestTarget(promise, requestHandlers);
    }
  
    RequestTarget.isActive = RequestTarget_isActive;
    RequestTarget.canBeDestroyed = RequestTarget_canBeDestroyed;
    RequestTarget.destroy = RequestTarget_destroy;
    RequestTarget.toJSON = RequestTarget_toJSON;
    RequestTarget.isPending = RequestTarget_isPending;
    RequestTarget.isTemporary = RequestTarget_isTemporary;
    RequestTarget.setTemporary = RequestTarget_setTemporary;
    RequestTarget.getStatus = RequestTarget_getStatus;
    RequestTarget.getQueueLength = RequestTarget_getQueueLength;
    RequestTarget.getQueueCommands = RequestTarget_getQueueCommands;
    RequestTarget.hadChildPromises = RequestTarget_hadChildPromises;
    RequestTarget.getRawPromise = RequestTarget_getRawPromise;
    RequestTarget.getChildren = RequestTarget_getChildren;
    RequestTarget.getChildrenCount = RequestTarget_getChildrenCount;
    RequestTarget.create = RequestTarget_create;
  
    return RequestTarget;
  })();
  
  'use strict';
  var DataAccessInterface = (function() {
  
    /**
     *
     * @param handlers
     * @param {} proxyEnabled
     * @param {ResourcePoolRegistry} [_poolRegistry]
     * @param {ResourcePool} [_pool]
     * @constructor
     */
    function DataAccessInterface(handlers, proxyEnabled, _poolRegistry, _pool) {
      if (proxyEnabled && !areProxiesAvailable()) {
        throw new Error('Proxies are not available in this environment');
      }
      var _handlers = RequestHandlers.create(proxyEnabled);
      var _factory = (proxyEnabled ? RequestProxyFactory : RequestFactory).create(_handlers);
      _poolRegistry = _poolRegistry || ResourcePoolRegistry.create();
      if (_pool) {
        _poolRegistry.register(_pool);
      } else if (_pool !== undefined) {
        _pool = _poolRegistry.createPool();
      } else {
        _pool = ResourcePoolRegistry.defaultResourcePool;
      }
      Object.defineProperties(this, {
        poolRegistry: {
          value: _poolRegistry
        },
        pool: {
          get: function() {
            return _pool;
          }
        },
        resourceConverter: {
          value: ResourceConverter.create(_factory, _poolRegistry, _pool, _handlers)
        },
        factory: {
          value: _factory
        },
        proxyEnabled: {
          get: function() {
            return _handlers.proxyEnabled;
          }
        }
      });
  
      function poolDestroyedHandler(event) {
        _pool.removeEventListener(ResourcePool.Events.POOL_DESTROYED, poolDestroyedHandler);
        _pool = _poolRegistry.createPool();
        _pool.addEventListener(ResourcePool.Events.POOL_DESTROYED, poolDestroyedHandler);
      }
  
      handlers.setHandlers(handlers);
      _pool.addEventListener(ResourcePool.Events.POOL_DESTROYED, poolDestroyedHandler);
    }
  
    function _parse(data) {
      return this.resourceConverter.parse(data);
    }
  
    function _toJSON(data) {
      return this.resourceConverter.toJSON(data);
    }
  
    DataAccessInterface.prototype.parse = _parse;
    DataAccessInterface.prototype.toJSON = _toJSON;
  
    //------------------ static
  
    function DataAccessInterface_create(handlers, proxyEnabled, poolRegistry, pool) {
      return new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool);
    }
  
    DataAccessInterface.create = DataAccessInterface_create;
    DataAccessInterface.createDeferred = createDeferred;
  
    DataAccessInterface.IConvertible = IConvertible;
    DataAccessInterface.RequestTarget = RequestTarget;
    DataAccessInterface.Deferred = Deferred;
    DataAccessInterface.Reserved = Reserved;
    DataAccessInterface.RequestTargetCommands = RequestTargetCommands;
    DataAccessInterface.CommandDescriptor = CommandDescriptor;
    DataAccessInterface.ProxyCommands = ProxyCommands;
    DataAccessInterface.ResourcePool = ResourcePool;
    DataAccessInterface.ResourcePoolRegistry = ResourcePoolRegistry;
    DataAccessInterface.ResourceConverter = ResourceConverter;
  
    return DataAccessInterface;
  })();
  
  
  return DataAccessInterface;
}));
