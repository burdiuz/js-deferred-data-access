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
  
  var createDeferred = (function() {
  
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
  
    /**
     * @returns {Deferred}
     */
    function createDeferred() {
      return new Deferred();
    }
  
    return createDeferred;
  })();
  
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
  
  /**
   * Created by Oleg Galaburda on 07.03.16.
   */
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
            return _keys.length;
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
      var list = ProxyCommands.list;
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
  
  var RequestTargetDecorator = (function() {
  
    /**
     *
     * @param handlers {RequestHandlers}
     * @constructor
     */
    function RequestTargetDecorator(_factory, _handlers) {
      var _members = {};
  
      function _getMember(propertyName, commandType) {
        if (!_members.hasOwnProperty(propertyName)) {
          function _commandHandler(command, value) {
            var promise = this[TARGET_INTERNALS].sendRequest(propertyName, commandType, command, value);
            return _factory.create(promise || Promise.reject('Initial request failed and didn\'t result in promise.'));
          }
  
          _members[propertyName] = _commandHandler;
        }
        return _members[propertyName];
      }
  
      function _decorate(request) {
        if (!_handlers.available) return;
        /* FIXME revert change when ES6 willbe supported widely
         for (var descriptor of _handlers) {
         request[descriptor.name] = _getMember(descriptor.name, descriptor.type);
         }
         */
        var iterator = _handlers[Symbol.iterator]();
        var result;
        while (!(result = iterator.next()).done) {
          var descriptor = result.value;
          request[descriptor.name] = _getMember(descriptor.name, descriptor.type);
        }
        return request;
      }
  
      this.decorate = _decorate;
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
  
  
  /**
   * Created by Oleg Galaburda on 13.03.16.
   */
  
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
        this[FACTORY_DECORATOR_FIELD].decorate(request);
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
  
  var RequestTargetInternals = (function() {
  
    /**
     *
     * @param _requestTarget {RequestTarget}
     * @param _promise {Promise}
     * @param _requestHandlers {RequestHandlers}
     * @constructor
     */
    function RequestTargetInternals(_requestTarget, _promise, _requestHandlers) {
      this._requestHandlers = _requestHandlers;
      this._requestTarget = _requestTarget;
      this.link = {};
      //INFO this should be not initialized i.e. keep it undefined, this will be checked later
      this.temporary;
      this.hadChildPromises = false;
      this.status = TargetStatus.PENDING;
      this.queue = [];
      this.promise = _promise.then(
        this._resolveHandler.bind(this),
        this._rejectHandler.bind(this)
      );
  
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
        this.temporary = this._requestHandlers.isTemporary(this._requestTarget);
        if (this.temporary) {
          this.queue[this.queue.length - 1][1].promise.then(this.destroy.bind(this), this.destroy.bind(this));
        }
        //INFO Sending "this" as result of resolve() handler, causes infinite loop of this.then(), so I've used wrapper object
        value = {target: this};
      }
      this._sendQueue();
      return value;
    }
  
    function _rejectHandler(value) {
      this.status = TargetStatus.REJECTED;
      while (this.queue && this.queue.length) {
        var request = this.queue.shift();
        request[1].reject(new Error('Target of the call was rejected and call cannot be sent.'));
      }
      this.queue = null;
      return value;
    }
  
    function _sendQueue() {
      while (this.queue && this.queue.length) {
        var request = this.queue.shift();
        var name = request[0];
        var pack = request[1];
        var deferred = request[2];
        pack.target = this.link.id;
        this._requestHandlers.handle(this._requestTarget, name, pack, deferred);
      }
      this.queue = null;
    }
  
    function _sendRequest(name, type, cmd, value) {
      var promise = null;
      if (this._requestHandlers.hasHandler(name)) {
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
          this._requestHandlers.handle(this._requestTarget, name, pack, deferred);
          break;
      }
      return promise;
    }
  
  
    function _isActive() {
      return this.status === TargetStatus.PENDING || this.status === TargetStatus.RESOLVED;
    }
  
    function _canBeDestroyed() {
      return this.status === TargetStatus.RESOLVED && this.link.id;
    }
  
    function _destroy() {
      var promise = null;
      if (this.canBeDestroyed()) {
        this.status = TargetStatus.DESTROYED;
        promise = this.sendRequest(RequestTargetCommands.DESTROY);
      } else {
        promise = Promise.reject();
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
  
    RequestTargetInternals.prototype._resolveHandler = _resolveHandler;
    RequestTargetInternals.prototype._rejectHandler = _rejectHandler;
    RequestTargetInternals.prototype._sendQueue = _sendQueue;
    RequestTargetInternals.prototype.sendRequest = _sendRequest;
    RequestTargetInternals.prototype._addToQueue = _addToQueue;
    RequestTargetInternals.prototype._applyRequest = _applyRequest;
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
  
  /**
   * Created by Oleg Galaburda on 07.03.16.
   */
  
  var RequestTarget = (function() {
  
    /**
     * The object that will be available on other side
     * @param _promise {Promise}
     * @param _requestHandlers {RequestHandlers}
     * @constructor
     */
    function RequestTarget(_promise, _requestHandlers) {
  
      Object.defineProperty(this, TARGET_INTERNALS, {
        value: new RequestTargetInternals(this, _promise, _requestHandlers)
      });
    }
  
    function _then() {
      this[TARGET_INTERNALS].then.apply(this[TARGET_INTERNALS], arguments);
    }
  
    function _catch() {
      this[TARGET_INTERNALS].catch.apply(this[TARGET_INTERNALS], arguments);
    }
  
    RequestTarget.prototype.then = _then;
    RequestTarget.prototype.catch = _catch;
  
    //------------- static
    function RequestTarget_isActive(target) {
      return target[TARGET_INTERNALS].isActive();
    }
  
    function RequestTarget_canBeDestroyed(target) {
      return target[TARGET_INTERNALS].canBeDestroyed();
    }
  
    function RequestTarget_destroy(target) {
      return target[TARGET_INTERNALS].destroy();
    }
  
    function RequestTarget_toJSON(target) {
      return target[TARGET_INTERNALS].toJSON();
    }
  
    function RequestTarget_isPending(value) {
      return value instanceof RequestTarget && RequestTarget_getStatus(value) == TargetStatus.PENDING;
    }
  
    function RequestTarget_isTemporary(target) {
      return Boolean(target[TARGET_INTERNALS].temporary);
    }
  
    function RequestTarget_setTemporary(target, value) {
      target[TARGET_INTERNALS].temporary = Boolean(value);
    }
  
    function RequestTarget_getStatus(target) {
      return target[TARGET_INTERNALS].status;
    }
  
    function RequestTarget_getQueueLength(target) {
      var queue = target[TARGET_INTERNALS].queue;
      return queue ? queue.length : 0;
    }
  
    function RequestTarget_getQueueCommands(target) {
      var length;
      var result = [];
      var queue = target[TARGET_INTERNALS].queue;
      if (queue) {
        length = queue.length;
        for (var index = 0; index < length; index++) {
          result.push(queue[index][0].type);
        }
      }
      return result;
    }
  
    function RequestTarget_hadChildPromises(target) {
      return target[TARGET_INTERNALS].hadChildPromises;
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
    RequestTarget.create = RequestTarget_create;
  
    return RequestTarget;
  })();
  
  var DataAccessInterface = (function() {
  
    function DataAccessInterface(proxyEnabled, _poolRegistry, _pool) {
      if (proxyEnabled && !areProxiesAvailable()) {
        throw new Error('Proxies are not available in this environment');
      }
      var _handlers = RequestHandlers.create(proxyEnabled);
      var _factory = (proxyEnabled ? RequestProxyFactory : RequestFactory).create(_handlers);
      _poolRegistry = _poolRegistry || ResourcePoolRegistry.create();
      if (_pool) {
        //FIXME it should listen for removed/destroyed event and create replacement pool automatically
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
          value: _pool
        },
        resourceConverter: {
          value: ResourceConverter.create(_factory, _pool, _handlers)
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
  
      this.setHandlers = _handlers.setHandlers;
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
  
    function DataAccessInterface_create(proxyEnabled) {
      return new DataAccessInterface(proxyEnabled);
    }
  
    DataAccessInterface.create = DataAccessInterface_create;
    DataAccessInterface.IConvertible = IConvertible;
    DataAccessInterface.RequestTarget = RequestTarget;
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
