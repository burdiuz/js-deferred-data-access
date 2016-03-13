// Uses Node, AMD or browser globals to create a module.
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['EventDispatcher'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('EventDispatcher'));
  } else {
    // Browser globals (root is window)
    root.DataAccessInterface = factory(root.EventDispatcher);
  }
}(this, function(EventDispatcher) {
  // here should be injected deferred-data-access.js content
  var CommandType = Object.freeze({
    //INFO Exposed Promise method, cannot be overwritten by command
    THEN: 'then',
    //INFO Exposed Promise method, cannot be overwritten by command
    CATCH: 'catch',
    DESTROY_TARGET: '::destroy.resource'
  });
  
  var TargetStatus = Object.freeze({
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
    DESTROYED: 'destroyed'
  });
  
  var RequestTargetCommands = Object.freeze({
    DESTROY: CommandType.DESTROY_TARGET
  });
  
  var ProxyCommands = Object.freeze({
    GET: 'get',
    SET: 'set',
    APPLY: 'apply'
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
  
  function getPoolResource(id) {
    var data = {};
    data[TARGET_DATA] = {
      id: id || 0,
      poolId: DataAccessInterface.pool.id
    };
    return data;
  }
  
  function getRAWResource(object) {
    var data;
    if (object instanceof TargetResource) {
      data = object.toJSON();
    } else if (object instanceof RequestTarget) {
      data = RequestTarget.toJSON(object);
    } else if (object instanceof IConvertible || typeof(object) === 'function') {
      data = DataAccessInterface.pool.set(object).toJSON();
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
    var id;
    if (object instanceof TargetResource || object instanceof RequestTarget) {
      id = object[TARGET_INTERNALS].id;
    } else if (isResource(object)) {
      id = object[TARGET_DATA].id;
    }
    return id;
  }
  
  function getResourcePoolId(object) {
    var poolId;
    if (isResource(object)) {
      poolId = object[TARGET_DATA].poolId;
    }
    return poolId;
  }
  
  function getResourceType(object) {
    var type;
    if (isResource(object)) {
      type = object[TARGET_DATA].type;
    }
    return type;
  }
  
  function isResource(object) {
    return object instanceof TargetResource ||
      object instanceof RequestTarget ||
      (object && typeof(object[TARGET_DATA]) === 'object' && object[TARGET_DATA]);
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
      return this[TARGET_INTERNALS].pool ? this[TARGET_INTERNALS].pool.id : null;
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
  
    function TargetResource_create(pool, target, id) {
      return new TargetResource(pool, target, id || getId());
    }
  
    TargetResource.create = TargetResource_create;
  
    return TargetResource;
  })();
  
  var TargetPool = (function() {
  
    var TargetPoolEvents = Object.freeze({
      RESOURCE_ADDED: 'resourceAdded',
      RESOURCE_REMOVED: 'resourceRemoved',
      POOL_CLEAR: 'poolClear',
      POOL_CLEARED: 'poolCleared',
      POOL_DESTROY: 'poolDestroy',
      POOL_DESTROYED: 'poolDestroyed'
    });
  
    /**
     * Map private field symbol
     */
    var MAP_FIELD = Symbol('TargetPool::map');
    var validTargets = {};
  
    /**
     * @constructor
     * @extends EventDispatcher
     */
    function TargetPool() {
      this[MAP_FIELD] = new Map();
  
      Object.defineProperties(this, {
        id: {
          value: getId()
        }
      });
  
      EventDispatcher.apply(this);
    }
  
    //------------ instance
  
    function _set(target, type) {
      var link = null;
      if (TargetPool.isValidTarget(target)) {
        if (this[MAP_FIELD].has(target)) {
          link = this[MAP_FIELD].get(target);
        } else {
          link = TargetResource.create(this, target, type || typeof(target));
          this[MAP_FIELD].set(link.id, link);
          this[MAP_FIELD].set(target, link);
          if (this.hasEventListener(TargetPoolEvents.RESOURCE_ADDED)) {
            this.dispatchEvent(TargetPoolEvents.RESOURCE_ADDED, link);
          }
        }
      }
      return link;
    };
  
    function _has(target) {
      return this[MAP_FIELD].has(target);
    }
  
    function _get(target) {
      return this[MAP_FIELD].get(target);
    }
  
    function _remove(target) {
      var link = this[MAP_FIELD].get(target);
      if (link) {
        this[MAP_FIELD].delete(link.id);
        this[MAP_FIELD].delete(link.resource);
        if (this.hasEventListener(TargetPoolEvents.RESOURCE_REMOVED)) {
          this.dispatchEvent(TargetPoolEvents.RESOURCE_REMOVED, link);
        }
        link.destroy();
      }
    }
  
    function _clear() {
      if (this.hasEventListener(TargetPoolEvents.POOL_CLEAR)) {
        this.dispatchEvent(TargetPoolEvents.POOL_CLEAR, this);
      }
      var list = this[MAP_FIELD].keys();
      var length = list.length;
      for (var index = 0; index < length; index++) {
        var key = list[index];
        if (typeof(key) === 'string') {
          var link = this[MAP_FIELD].get(key);
          link.destroy();
        }
      }
      this[MAP_FIELD].clear();
      if (this.hasEventListener(TargetPoolEvents.POOL_CLEARED)) {
        this.dispatchEvent(TargetPoolEvents.POOL_CLEARED, this);
      }
    }
  
    function _destroy() {
      if (this.hasEventListener(TargetPoolEvents.POOL_DESTROY)) {
        this.dispatchEvent(TargetPoolEvents.POOL_DESTROY, this);
      }
      this.clear();
      // intentionally make it not usable after its destroyed
      this[MAP_FIELD] = null;
      TargetPoolRegistry.remove(this);
      if (this.hasEventListener(TargetPoolEvents.POOL_DESTROYED)) {
        this.dispatchEvent(TargetPoolEvents.POOL_DESTROYED, this);
      }
    }
  
    TargetPool.prototype = EventDispatcher.createNoInitPrototype();
    TargetPool.prototype.constructor = TargetPool;
  
    TargetPool.prototype.set = _set;
    TargetPool.prototype.has = _has;
    TargetPool.prototype.get = _get;
    TargetPool.prototype.remove = _remove;
    TargetPool.prototype.clear = _clear;
    TargetPool.prototype.destroy = _destroy;
  
    //------------ static
  
    function TargetPool_isValidTarget(target) {
      return target && validTargets[typeof(target)];
    };
  
    /**
     *
     * @param list {string[]} Types acceptable as resource targets to be stored in TargetPool
     * @returns void
     */
    function TargetPool_setValidTargets(list) {
      validTargets = {};
      var length = list.length;
      for (var index = 0; index < length; index++) {
        validTargets[list[index]] = true;
      }
    }
  
    /**
     *
     * @returns {string[]} Default types acceptable by TargetPool
     * @returns Array
     */
    function TargetPool_getDefaultValidTargets() {
      return ['object', 'function'];
    }
  
    function TargetPool_create() {
      return new TargetPool();
    }
  
    TargetPool.isValidTarget = TargetPool_isValidTarget;
    TargetPool.setValidTargets = TargetPool_setValidTargets;
    TargetPool.getDefaultValidTargets = TargetPool_getDefaultValidTargets;
    TargetPool.create = TargetPool_create;
    TargetPool.Events = TargetPoolEvents;
  
    // setting default valid targets
    TargetPool.setValidTargets(TargetPool.getDefaultValidTargets());
  
    return TargetPool;
  })();
  
  /**
   * Global registry per environment
   * @type _TargetPoolRegistry
   */
  var TargetPoolRegistry = (function() {
  
    var _registry = {};
  
    /**
     *
     * @returns {TargetPool}
     * @private
     */
    function _createPool() {
      var pool = TargetPool.create();
      _register(pool);
      return pool;
    }
  
    /**
     *
     * @param pool {TargetPool}
     * @private
     */
    function _register(pool) {
      _registry[pool.id] = pool;
      pool.addEventListener(TargetPool.Events.POOL_DESTROY, this._poolDestroyListener);
    }
  
    /**
     *
     * @param poolId {String}
     * @returns {TargetPool|null}
     * @private
     */
    function _get(poolId) {
      return _registry[poolId] || null;
    }
  
    /**
     *
     * @param pool {TargetPool|String}
     * @returns {Boolean}
     * @private
     */
    function _isRegistered(pool) {
      return _registry.hasOwnProperty(pool instanceof TargetPool ? pool.id : String(pool));
    }
  
    /**
     *
     * @param pool {TargetPool|String}
     * @returns {Boolean}
     * @private
     */
    function _remove(pool) {
      var result = false;
      pool = pool instanceof TargetPool ? pool : _get(pool);
      if (pool) {
        pool.removeEventListener(TargetPool.Events.POOL_DESTROY, this._poolDestroyListener);
        result = delete _registry[pool.id];
      }
      return result;
    }
  
    function __poolDestroyListener(event) {
      _remove(event.data);
    }
  
    /**
     * @private
     * @constructor
     */
    function _TargetPoolRegistry() {
  
    }
  
    _TargetPoolRegistry.prototype.createPool = _createPool;
    _TargetPoolRegistry.prototype.register = _register;
    _TargetPoolRegistry.prototype.get = _get;
    _TargetPoolRegistry.prototype.isRegistered = _isRegistered;
    _TargetPoolRegistry.prototype.remove = _remove;
    /**
     * @private
     */
    _TargetPoolRegistry.prototype._poolDestroyListener = __poolDestroyListener;
  
    return new _TargetPoolRegistry();
  })();
  
  /**
   * Created by Oleg Galaburda on 07.03.16.
   */
  //TODO If RequestTarget, RequestTargetLink or their proxies are passed, they should be converted to RAW links.
  /**
   * @type ResourceConverter
   */
  var ResourceConverter = (function() {
  
    var FACTORY_FIELD = Symbol('resource.converter::factory');
  
    var ResourceConverterEvents = Object.freeze({
      RESOURCE_CREATED: 'resourceCreated',
      RESOURCE_CONVERTED: 'resourceConverted'
    });
  
    /**
     * @param factory {RequestFactory}
     * @constructor
     * @extends EventDispatcher
     */
    function ResourceConverter(factory, handlers) {
      this[FACTORY_FIELD] = factory;
      EventDispatcher.apply(this);
      if (handlers) {
        handlers.setConverter(this);
      }
    }
  
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
  
    function _objectToResource(data) {
      var result;
      var poolId = getResourcePoolId(data);
      if (TargetPoolRegistry.isRegistered(poolId)) { // target object is stored in current pool
        data = TargetPoolRegistry.get(poolId).get(getResourceId(data));
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
    function ResourceConverter_create(factory, handlers) {
      return new ResourceConverter(factory, handlers);
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
     * @returns {boolean}
     */
    function Default_isTemporary() {
      return false;
    }
  
    /**
     * @constructor
     */
    function RequestHandlers(proxyEnabled) {
      var _isTemporary = Default_isTemporary;
      var _handlers = {};
      var _converter;
      var _available = false;
  
      Object.defineProperties(this, {
        isTemporary: {
          get: function() {
            return _isTemporary;
          },
          set: function(value) {
            _isTemporary = typeof(value) === 'function' ? value : Default_isTemporary;
          }
        },
        available: {
          get: function() {
            return _available;
          }
        }
      });
  
      function _setConverter(converter) {
        _converter = converter;
      }
  
      function _setHandlers(handlers) {
        var list = [];
        handlers = RequestHandlers.filterHandlers(handlers, list);
        if (proxyEnabled) {
          RequestHandlers.areProxyHandlersAvailable(handlers, true);
        }
        _available = Boolean(list.length);
        _handlers = handlers;
      }
  
      function _hasHandler(type) {
        return _handlers.hasOwnProperty(type);
      }
  
      function _getHandlers() {
        return _handlers;
      }
  
      function _getHandler(type) {
        return _handlers[type] || null;
      }
  
      function _handle(resource, pack, deferred) {
        var list = _converter ? _converter.lookupForPending(pack.value) : null;
        if (list && list.length) {
          // FIXME Need to test on all platforms: In other browsers this might not work because may need list of Promise objects, not RequestTargets
          Promise.all(list).then(function() {
            _handleImmediately(resource, pack.type, pack, deferred);
          });
        } else {
          _handleImmediately(resource, pack.type, pack, deferred);
        }
      }
  
      function _handleImmediately(resource, type, data, deferred) {
        var handler = _getHandler(type);
        if (typeof(handler) === 'function') {
          //INFO result should be applied to deferred.resolve() or deferred.reject()
          handler(resource, data, deferred);
        }
  
      }
  
      this.setConverter = _setConverter;
      this.setHandlers = _setHandlers;
      this.hasHandler = _hasHandler;
      this.getHandlers = _getHandlers;
      this.getHandler = _getHandler;
      this.handle = _handle;
    }
  
    //------------------- static
  
    function RequestHandlers_filterHandlers(handlers, names) {
      var typeHandlers = {};
      for (var name in handlers) {
        if (handlers.hasOwnProperty(name)) {
          if (typeof(handlers[name]) === 'function') {
            if (name in CommandType) {
              throw new Error('Name "' + name + '" is reserved and cannot be used as command handler.');
            } else {
              names.push(name);
              typeHandlers[name] = handlers[name];
            }
          }
        }
      }
      return typeHandlers;
    }
  
    /**
     * @returns {RequestHandlers}
     */
    function RequestHandlers_create(proxyEnabled) {
      return new RequestHandlers(proxyEnabled);
    }
  
    function RequestHandlers_areProxyHandlersAvailable(handlers, throwError) {
      var result = true;
      for (var name in ProxyCommands) {
        if (ProxyCommands.hasOwnProperty(name) && !(ProxyCommands[name] in handlers)) {
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
  })();
  
  var RequestTargetDecorator = (function() {
  
    /**
     *
     * @param handlers {RequestHandlers}
     * @constructor
     */
    function RequestTargetDecorator(_factory, _handlers) {
      var _members = {};
  
      function _getMember(name) {
        if (!_members.hasOwnProperty(name)) {
          _members[name] = (function(type) {
            function _commandHandler(command, value) {
              var promise = this[TARGET_INTERNALS].sendRequest(type, command, value);
              return _factory.create(promise || Promise.reject('Initial request failed and didn\'t result in promise.'));
            }
  
            return _commandHandler;
          })(name);
        }
        return _members[name];
      }
  
      function _decorate(request) {
        var handlers = _handlers.getHandlers();
        for (var name in handlers) {
          if (handlers.hasOwnProperty(name)) {
            request[name] = _getMember(name);
          }
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
    function RequestTargetDecorator_create(handlers) {
      return new RequestTargetDecorator(handlers);
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
      this[FACTORY_DECORATOR_FIELD] = new RequestTargetDecorator(this, handlers);
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
        var pack = request[0];
        var deferred = request[1];
        pack.target = this.link.id;
        this._requestHandlers.handle(this._requestTarget, pack, deferred);
      }
      this.queue = null;
    }
  
    function _sendRequest(type, cmd, value) {
      var promise = null;
      if (this._requestHandlers.hasHandler(type)) {
        var pack = RequestTargetInternals.createRequestPackage(type, cmd, value, this.id);
        promise = this._applyRequest(pack, createDeferred());
      } else {
        throw new Error('Request handler of type "' + type + '" is not registered.');
      }
      return promise;
    }
  
    function _addToQueue(pack, deferred) {
      this.queue.push([pack, deferred]);
    }
  
  
    function _applyRequest(pack, deferred) {
      var promise = deferred.promise;
      var type = pack.type;
      switch (this.status) {
        case TargetStatus.PENDING:
          this._addToQueue(pack, deferred);
          break;
        case TargetStatus.REJECTED:
          promise = Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
          break;
        case TargetStatus.DESTROYED:
          promise = Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
          break;
        case TargetStatus.RESOLVED:
          this._requestHandlers.handle(this._requestTarget, pack, deferred);
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
        promise = this.sendRequest(CommandType.DESTROY_TARGET);
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
  
    function DataAccessInterface(proxyEnabled) {
      if (proxyEnabled && !areProxiesAvailable()) {
        throw new Error('Proxies are not available in this environment');
      }
      var _handlers = RequestHandlers.create(proxyEnabled);
      var _factory = (proxyEnabled ? RequestProxyFactory : RequestFactory).create(_handlers);
      Object.defineProperties(this, {
        poolRegistry: {
          value: TargetPoolRegistry
        },
        pool: {
          value: TargetPoolRegistry.createPool()
        },
        resourceConverter: {
          value: ResourceConverter.create(_factory, _handlers)
        },
        factory: {
          value: _factory
        },
        proxyEnabled: {
          value: proxyEnabled
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
    DataAccessInterface.RequestTargetCommands = RequestTargetCommands;
    DataAccessInterface.ProxyCommands = ProxyCommands;
    DataAccessInterface.TargetPoolEvents = TargetPool.Events;
    DataAccessInterface.ResourceConverterEvents = ResourceConverter.Events;
  
    return DataAccessInterface;
  })();
  
  
  return DataAccessInterface;
}));
