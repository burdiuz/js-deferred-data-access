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
  /**
   * Created by Oleg Galaburda on 29.03.16.
   */
   /**
   * @ignore
   */
  var DataAccessInterface = (function() {
    /**
     * @exports ICacheImpl
     * @exports CommandDataPack
     * @exports EventDispatcher
     * @exports RAWResource
     */
    
    /**
     * @typedef {Object} EventDispatcher For more information look in GitHub [EventDispatcher]{@link https://github.com/burdiuz/js-event-dispatcher} repo.
     * @property {Function} addEventListener
     * @property {Function} removeEventListener
     * @property {Function} hasEventListener
     * @property {Function} dispatchEvent
     */
    
    /**
     * @typedef {Object} CommandDataPack
     * @property {string} type Command type
     * @property {string} cmd Command string
     * @property {*} value Command value
     * @property {string} target Target resource ID that issued command
     * @property {Arguments} args Non-enumerable property that holds Arguments passed to command handler function. Since its non-enumerable, it will not be processed `JSON.stringify()`.
     */
    
    /**
     * @typedef {Object} RAWResource
     * @property {string} id Id string of registered resource target
     * @property {string} type Resource target value type
     * @property {string} poolId ResourcePool Id where resource is stored, was registered
     */
    
    /**
     * @typedef {Object} ICacheImpl
     * @property {ICacheImpl~get} get Retrieve from cache RequestTarget instance by property name and command data
     * @property {ICacheImpl~set} set Store to cache RequestTarget instance by property name and command data
     * @interface
     */
    
    /**
     * @callback ICacheImpl~get
     * @param {string} propertyName Command property name
     * @param {CommandDataPack} pack Command data pack
     * @returns {RequestTarget|null}
     */
    
    /**
     * @callback ICacheImpl~set
     * @param {RequestTarget} request RequestTarget that should be stored
     * @param {string} propertyName Command property name
     * @param {CommandDataPack} pack Command data pack
     */
    
    'use strict';
    
    var TargetStatus = Object.freeze({
      PENDING: 'pending',
      RESOLVED: 'resolved',
      REJECTED: 'rejected',
      DESTROYED: 'destroyed'
    });
    
    /**
     * @type {Symbol}
     * @private
     */
    var TARGET_INTERNALS = Symbol('request.target:internals');
    /**
     *
     * @type {string}
     * @private
     */
    var TARGET_DATA = 'resource::data';
    
    /**
     * @private
     */
    var getId = (function() {
      var _base = 'DA/' + String(Date.now()) + '/';
      var _index = 0;
      return function() {
        return _base + String(++_index) + '/' + String(Date.now());
      };
    })();
    
    /**
     * @constructor
     * @alias DataAccessInterface.Deferred
     */
    var Deferred = (function() {
      function Deferred() {
        this._status = TargetStatus.PENDING;
        this.promise = new Promise(function(resolve, reject) {
          this.resolve = resolve;
          this.reject = reject;
        }.bind(this));
      }
    
      return Deferred;
    })();
    
    /**
     * @returns {Deferred}
     * @private
     */
    function createDeferred() {
      return new Deferred();
    }
    /**
     * @returns {boolean}
     * @private
     */
    function areProxiesAvailable() {
      return typeof(Proxy) === 'function';
    }
    
    /**
     * Interface for all resource types, these will be treated as resources automatically
     * @interface
     * @alias DataAccessInterface.IConvertible
     */
    function IConvertible() {
    
    }
    /**
     * @method DataAccessInterface.getRAWResource
     * @param object
     * @param pool
     * @returns {*}
     */
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
    
    /**
     * @method DataAccessInterface.getResourceData
     * @param {*} object
     * @returns {null}
     */
    function getResourceData(object) {
      var data = getRAWResource(object);
      return data ? data[TARGET_DATA] : null;
    }
    
    /**
     * @method DataAccessInterface.getResourceId
     * @param object
     * @returns {*}
     */
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
    
    /**
     * @method DataAccessInterface.getResourcePoolId
     * @param object
     * @returns {*}
     */
    function getResourcePoolId(object) {
      var poolId = null;
      if (typeof(object[TARGET_INTERNALS]) === 'object') {
        poolId = object[TARGET_INTERNALS].poolId;
      } else if (isResource(object)) {
        poolId = object[TARGET_DATA].poolId;
      }
      return poolId;
    }
    
    /**
     * @method DataAccessInterface.getResourceType
     * @param object
     * @returns {*}
     */
    function getResourceType(object) {
      var type = null;
      if (typeof(object[TARGET_INTERNALS]) === 'object') {
        type = object[TARGET_INTERNALS].type;
      } else if (isResource(object)) {
        type = object[TARGET_DATA].type;
      }
      return type;
    }
    
    function createForeignResource(type) {
      var resource = {};
      resource[TARGET_DATA] = {
        id: 'foreign-id-' + getId(),
        type: type || typeof(resource),
        poolId: 'foreign-poolId-' + getId()
      };
      return resource;
    }
    
    /**
     * @method DataAccessInterface.isResource
     * @param object
     * @returns {boolean|*}
     */
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
    
    /**
     * @method DataAccessInterface.isResourceConvertible
     * @param data
     * @returns {boolean}
     */
    function isResourceConvertible(data) {
      return isResource(data) || typeof(data) === 'function' || data instanceof IConvertible;
    }
    
    /**
     * @method DataAccessInterface.isResourceConvertible
     * @param {RAWResource|TargetResource|RequestTarget} resource1
     * @param {RAWResource|TargetResource|RequestTarget} resource2
     * @returns {boolean}
     */
    function areSameResource(resource1, resource2) {
      return isResource(resource1) && isResource(resource2) &&
        getResourceId(resource1) === getResourceId(resource2) &&
        getResourcePoolId(resource1) === getResourcePoolId(resource2);
    }
    
    'use strict';
    /**
     * @exports DataAccessInterface.CommandDescriptor
     * @exports DataAccessInterface.ProxyCommands
     * @exports DataAccessInterface.Reserved
     */
    
    /**
     * @callback DataAccessInterface.CommandDescriptor~handle
     * @param {DataAccessInterface.RequestTarget} parentRequest
     * @param {CommandDataPack} pack
     * @param {DataAccessInterface.Deferred} deferred
     * @param {DataAccessInterface.RequestTarget} [resultRequest]
     * @returns {void}
     */
    
    /**
     * @callback DataAccessInterface.CommandDescriptor~isTemporary
     * @param {DataAccessInterface.RequestTarget} parentRequest
     * @param {?DataAccessInterface.RequestTarget} resultRequest
     * @param {CommandDataPack} pack
     * @param {*} data
     * @returns {boolean} If true, RequestTarget object will be destroyed after serving last command in its queue.
     */
    
    /**
     * @typedef {Object} DataAccessInterface.ProxyCommands~fields
     * @property {Symbol} get
     * @property {Symbol} set
     * @property {Symbol} apply
     * @property {Symbol} deleteProperty
     */
    /**
     * @typedef {Object} DataAccessInterface.Reserved~names
     * @property {boolean} then "then" is a reserved word for property name and cannot be used in CommandDescriptor.
     * @property {boolean} catch "catch" is a reserved word for property name and cannot be used in CommandDescriptor.
     */
    
    /**
     * @ignore
     */
    var CommandDescriptor = (function() {
    
      /**
       * @returns {boolean}
       */
      function Default_isTemporary() {
        return false;
      }
    
      /**
       * @class DataAccessInterface.CommandDescriptor
       * @classdesc CommandDescriptor represents command that should be executed on resource object.
       * Each CommandDescriptor must describe property name, command type and handler function that will be called when command should be executed.
       * When new resource parsed from RAW object, it will be converted to RequestTarget.
       * Each RequestTarget object is decorated with methods named by `CommandDescriptor.name`.
       * Calling this method will start `CommandDescriptor.type` command execution and immediately returns a Promise that should be resolved in `CommandDescriptor.handle`.
       * Optionally isTemporary, cacheable and virtual parameters may be supplied.
       * @param {String|Object} type Command type
       * @param {DataAccessInterface.CommandDescriptor~handle} handle Command handle function
       * @param {String|Symbol} [name=] Method name
       * @param {DataAccessInterface.CommandDescriptor~isTemporary} [isTemporary=]
       * @param {boolean} [cacheable=false]
       * @param {boolean} [virtual=false]
       */
      function CommandDescriptor(type, handle, name, isTemporary, cacheable, virtual) {
        /**
         * Property name that will be used to place command handler function into RequestTarget.
         * If name was not provided, command type string will be used instead.
         * It is allowed to have multiple CommandDescriptors for same command type but with different property names.
         * @member {String|Symbol} DataAccessInterface.CommandDescriptor#
         */
        this.name = name !== undefined ? name : type;
        /**
         * Command type, it will be passed to handler
         * @member {String|Object} DataAccessInterface.CommandDescriptor#type
         */
        this.type = type;
        /**
         * Handler function, it will be called each time when RequestTarget[name]() executed
         * @member {DataAccessInterface.CommandDescriptor~handle} DataAccessInterface.CommandDescriptor#handle
         */
        this.handle = handle;
        /**
         * This callback must return true if RequestTarget should be destroyed after resolving promise passed to handler function.
         * If not provided, will be used default isTemplate() implementation, that always returns false.
         * @member {DataAccessInterface.CommandDescriptor~isTemporary} DataAccessInterface.CommandDescriptor#isTemporary
         */
        this.isTemporary = isTemporary || Default_isTemporary;
        /**
         * If true and ICacheImpl instance was provided, RequestTarget will be passed to ICacheImpl. By default, false.
         * @member {boolean} DataAccessInterface.CommandDescriptor#cacheable
         */
        this.cacheable = Boolean(cacheable);
        /**
         * If true, command handler will not be created on RequestTarget instance. So it can be called only using internal methods. By default, false.
         * @member {boolean} DataAccessInterface.CommandDescriptor#virtual
         */
        this.virtual = Boolean(virtual);
      }
    
      // Since its VO it should not contain any methods that may change its internal state
    
      //---------------
    
      /**
       * Creates immutable CommandDescriptor instance. It is strongly recommended to use CommandDescriptor.create() instead of using "new" operator.
       * @method DataAccessInterface.CommandDescriptor.create
       * @param {string} command
       * @param {Function} handle
       * @param {string} [name=]
       * @param {Function} [isTemporary=]
       * @param {Boolean} [cacheable=false]
       * @param {Boolean} [virtual=false]
       * @returns {CommandDescriptor}
       */
      function CommandDescriptor_create(command, handle, name, isTemporary, cacheable, virtual) {
        var descriptor = new CommandDescriptor(command, handle, name, isTemporary, cacheable, virtual);
        // We can use Object.freeze(), it keeps class/constructor information
        return Object.freeze(descriptor);
      }
    
      CommandDescriptor.create = CommandDescriptor_create;
    
      return CommandDescriptor;
    })();
    
    function addDescriptorTo(descriptor, target) {
      if (target instanceof Array) {
        target.push(descriptor);
      } else if (target) {
        target[descriptor.name] = descriptor;
      }
    }
    
    function descriptorGeneratorFactory(command, name) {
      return function descriptorSetter(handle, isTemporary, target, cacheable) {
        var descriptor = CommandDescriptor.create(command, handle, name, isTemporary, cacheable);
        addDescriptorTo(descriptor, target);
        return descriptor;
      }
    }
    
    /**
     * Destroy is unique type that exists for every RequestTarget and does not have a method on its instances.
     * This type will be send each time RequestTarget.destroy() is applied to RequestTarget in stance.
     * @type {Object}
     */
    var RequestTargetCommands = (function() {
      var DESTROY_FIELD = Symbol('::destroy.resource');
      var commands = {
        DESTROY: '::destroy.resource',
        fields: Object.freeze({
          DESTROY: DESTROY_FIELD
        })
      };
      commands.createDESTROYDescriptor = function(handle, target) {
        var descriptor = CommandDescriptor.create(commands.DESTROY, handle, commands.fields.DESTROY, null, false, true);
        addDescriptorTo(descriptor, target);
        return descriptor;
      };
      return Object.freeze(commands);
    })();
    /**
     * Commands used by Proxy wrapper to get/set properties and call functions/methods.
     * @namespace {Object} DataAccessInterface.ProxyCommands
     */
    var ProxyCommands = (function() {
    
      var commands = {
        /**
         * @member {string} DataAccessInterface.ProxyCommands.GET
         */
        GET: 'get',
        /**
         * @member {string} DataAccessInterface.ProxyCommands.SET
         */
        SET: 'set',
        /**
         * @member {string} DataAccessInterface.ProxyCommands.APPLY
         */
        APPLY: 'apply',
        /**
         * @member {string} DataAccessInterface.ProxyCommands.DELETE_PROPERTY
         */
        DELETE_PROPERTY: 'deleteProperty'
      };
      /**
       * Property names for CommandDescriptor's created for Proxy wrappers.
       * @member {DataAccessInterface.ProxyCommands~fields} DataAccessInterface.ProxyCommands.fields
       */
      commands.fields = Object.freeze({
        get: Symbol('proxy.commands::get'),
        set: Symbol('proxy.commands::set'),
        apply: Symbol('proxy.commands::apply'),
        deleteProperty: Symbol('proxy.commands::deleteProperty')
      });
    
      function get_list() {
        return [commands.GET, commands.SET, commands.APPLY, commands.DELETE_PROPERTY];
      }
    
      function get_required() {
        return [commands.GET, commands.SET, commands.APPLY];
      }
    
      function createDescriptors(handlers, isTemporary, target, cacheable) {
        var handler, name, field, descriptor;
        var list = ProxyCommands.list;
        var length = list.length;
        target = target || {};
        for (var index = 0; index < length; index++) {
          name = list[index];
          handler = handlers[name];
          field = ProxyCommands.fields[name];
          if (handler instanceof Function) {
            descriptor = CommandDescriptor.create(name, handler, field, isTemporary, cacheable);
            if (target instanceof Array) {
              target.push(descriptor);
            } else if (target) {
              target[field] = descriptor;
            }
          }
        }
        return target;
      }
    
      Object.defineProperties(commands, {
        /**
         * List of possible commands forProxy wrapper.
         * @member {string[]} DataAccessInterface.ProxyCommands.list
         */
        list: {
          get: get_list
        },
        /**
         * List of required commands for Proxy wrapper to work properly, if one of required CommandDescriptor's was not provided, Error will be raised.
         * @member {string[]} DataAccessInterface.ProxyCommands.required
         */
        required: {
          get: get_required
        }
      });
    
      commands.createGETDescriptor = descriptorGeneratorFactory(commands.GET, commands.fields.get);
      commands.createSETDescriptor = descriptorGeneratorFactory(commands.SET, commands.fields.set);
      commands.createAPPLYDescriptor = descriptorGeneratorFactory(commands.APPLY, commands.fields.apply);
      commands.createDescriptors = createDescriptors;
      return Object.freeze(commands);
    })();
    
    /**
     * Reserved words
     * @namespace {Object} DataAccessInterface.Reserved
     */
    var Reserved = Object.freeze({
      /**
       * Contains property names that cannot be used for CommandDescriptor's
       * @member {DataAccessInterface.Reserved~names} DataAccessInterface.Reserved.names
       * @see DataAccessInterface.CommandDescriptor#name
       */
      names: Object.freeze({
        //INFO Exposed Promise method, cannot be overwritten by type
        then: true,
        //INFO Exposed Promise method, cannot be overwritten by type
        catch: true
      })
    });
    
    'use strict';
    /**
     * @exports TargetResource
     */
    /**
     * @ignore
     */
    var TargetResource = (function() {
      /**
       * @class TargetResource
       * @classdesc Instance of TargetResource represents resource that is ready to send to other environment. They are generated when target value added to ResourcePool via `set()` method.
       * @param {DataAccessInterface.ResourcePool} pool Resource pool where resource target was registered
       * @param {*} resource Resource target value, should be value of acceptable type
       * @param {string} resourceType Resource target type string, custom or generated by typeof() operator
       * @param {string} id Resource Id string
       * @see DataAccessInterface.ResourcePool#set
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
          /**
           * TRUE while resource is available in ResourcePool, after TargetResource is destroyed, its `active` property changes to FALSE.
           * @member {boolean} TargetResource#active
           */
          active: {
            get: get_active
          },
          /**
           * Id of ResourcePool where target value is stored.
           * @member {string} TargetResource#poolId
           * @see DataAccessInterface.ResourcePool
           */
          poolId: {
            get: get_poolId
          },
          /**
           * Target resource value that was stored in ResourcePool
           * @member {*} TargetResource#resource
           */
          resource: {
            get: get_resource
          },
          /**
           * Resource value type, it may be custom string or result of typeof() operator.
           * @member {string} TargetResource#type
           */
          type: {
            get: get_type
          },
          /**
           * Resource Id, unique identifier, generated for each target value stored in ResourcePool. TargetResource instance can be requested from pool via Id.
           * @member {string} TargetResource#id
           */
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
    
      /**
       * @method TargetResource#toJSON
       * @returns {RAWResource}
       */
      function _toJSON() {
        var data = {};
        data[TARGET_DATA] = {
          id: this[TARGET_INTERNALS].id,
          type: this.type,
          poolId: this.poolId
        };
        return data;
      }
    
      /**
       * Remove target value from its ResourcePool and destroy TargetResource. After its destroyed, it cannot be used anywhere, all its values will be cleared.
       * @method TargetResource#destroy
       * @returns {void}
       */
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
    
      /**
       * @method TargetResource.create
       * @param {DataAccessInterface.ResourcePool} pool
       * @param {*} resource
       * @param {string} resourceType
       * @param {string} [id]
       * @returns {TargetResource}
       */
      function TargetResource_create(pool, resource, resourceType, id) {
        return new TargetResource(pool, resource, resourceType, id || getId());
      }
    
      TargetResource.create = TargetResource_create;
    
      return TargetResource;
    })();
    
    'use strict';
    /**
     * @exports DataAccessInterface.ResourcePool
     */
    
    /**
     * @typedef {Object} DataAccessInterface.ResourcePool~Events
     * @property {string} RESOURCE_ADDED Event for added resource
     * @property {string} RESOURCE_REMOVED Event for removed resource
     * @property {string} POOL_CLEAR Event for ResourcePool being cleared
     * @property {string} POOL_CLEARED Event for cleared ResourcePool
     * @property {string} POOL_DESTROYED Event for destroyed ResourcePool
     */
    
    /**
     * @ignore
     */
    var ResourcePool = (function() {
    
      /**
       * @member {DataAccessInterface.ResourcePool~Events} DataAccessInterface.ResourcePool.Events
       */
      var ResourcePoolEvents = Object.freeze({
        RESOURCE_ADDED: 'resourceAdded',
        RESOURCE_REMOVED: 'resourceRemoved',
        POOL_CLEAR: 'poolClear',
        POOL_CLEARED: 'poolCleared',
        POOL_DESTROYED: 'poolDestroyed'
      });
    
      /**
       * Map private field symbol
       */
      var MAP_FIELD = Symbol('ResourcePool::map');
      var validTargets = {};
    
      /**
       * @class DataAccessInterface.ResourcePool
       * @extends EventDispatcher
       */
      function ResourcePool() {
        this[MAP_FIELD] = new Map();
    
        Object.defineProperties(this, {
          id: {
            value: getId()
          }
        });
    
        EventDispatcher.apply(this);
      }
    
      //------------ instance
      /**
       * @method DataAccessInterface.ResourcePool#set
       * @param target
       * @param type
       * @returns {TargetResource}
       */
      function _set(target, type) {
        var link = null;
        if (ResourcePool.isValidTarget(target)) {
          if (this[MAP_FIELD].has(target)) {
            link = this[MAP_FIELD].get(target);
          } else {
            link = TargetResource.create(this, target, type || typeof(target));
            this[MAP_FIELD].set(link.id, link);
            this[MAP_FIELD].set(target, link);
            if (this.hasEventListener(ResourcePoolEvents.RESOURCE_ADDED)) {
              this.dispatchEvent(ResourcePoolEvents.RESOURCE_ADDED, link);
            }
          }
        }
        return link;
      }
    
      /**
       * @method DataAccessInterface.ResourcePool#has
       * @param target
       * @returns {boolean}
       */
      function _has(target) {
        return this[MAP_FIELD].has(target);
      }
    
      /**
       * @method DataAccessInterface.ResourcePool#get
       * @param target
       * @returns {TargetResource}
       */
      function _get(target) {
        return this[MAP_FIELD].get(target);
      }
    
      /**
       * @method DataAccessInterface.ResourcePool#remove
       * @param target
       */
      function _remove(target) {
        var link = this[MAP_FIELD].get(target);
        if (link) {
          this[MAP_FIELD].delete(link.id);
          this[MAP_FIELD].delete(link.resource);
          if (this.hasEventListener(ResourcePoolEvents.RESOURCE_REMOVED)) {
            this.dispatchEvent(ResourcePoolEvents.RESOURCE_REMOVED, link);
          }
          link.destroy();
        }
      }
    
      /**
       * @method DataAccessInterface.ResourcePool#clear
       */
      function _clear() {
        if (this.hasEventListener(ResourcePoolEvents.POOL_CLEAR)) {
          this.dispatchEvent(ResourcePoolEvents.POOL_CLEAR, this);
        }
        var key;
        var keys = this[MAP_FIELD].keys();
        //FIXME update to for...of loop when it comes to browsers
        while (!(key = keys.next()).done) {
          if (typeof(key.value) === 'string') {
            var link = this[MAP_FIELD].get(key.value);
            link.destroy();
          }
        }
        this[MAP_FIELD].clear();
        if (this.hasEventListener(ResourcePoolEvents.POOL_CLEARED)) {
          this.dispatchEvent(ResourcePoolEvents.POOL_CLEARED, this);
        }
      }
    
      /**
       * @method DataAccessInterface.ResourcePool#isActive
       * @returns {boolean}
       */
      function _isActive() {
        return Boolean(this[MAP_FIELD]);
      }
    
      /**
       * @method DataAccessInterface.ResourcePool#destroy
       */
      function _destroy() {
        this.clear();
        // intentionally make it not usable after its destroyed
        delete this[MAP_FIELD];
        if (this.hasEventListener(ResourcePoolEvents.POOL_DESTROYED)) {
          this.dispatchEvent(ResourcePoolEvents.POOL_DESTROYED, this);
        }
      }
    
      ResourcePool.prototype = EventDispatcher.createNoInitPrototype();
      ResourcePool.prototype.constructor = ResourcePool;
    
      ResourcePool.prototype.set = _set;
      ResourcePool.prototype.has = _has;
      ResourcePool.prototype.get = _get;
      ResourcePool.prototype.remove = _remove;
      ResourcePool.prototype.clear = _clear;
      ResourcePool.prototype.isActive = _isActive;
      ResourcePool.prototype.destroy = _destroy;
    
      //------------ static
      /**
       * @method DataAccessInterface.ResourcePool.isValidTarget
       * @param target
       * @returns {boolean}
       */
      function ResourcePool_isValidTarget(target) {
        return !isResource(target) && Boolean(validTargets[typeof(target)]);
      }
    
      /**
       * @method DataAccessInterface.ResourcePool.setValidTargets
       * @param list {string[]} Types acceptable as resource targets to be stored in ResourcePool
       * @returns void
       */
      function ResourcePool_setValidTargets(list) {
        validTargets = {};
        var length = list.length;
        for (var index = 0; index < length; index++) {
          validTargets[list[index]] = true;
        }
      }
    
      /**
       * @method DataAccessInterface.ResourcePool.getDefaultValidTargets
       * @returns {string[]} Default types acceptable by ResourcePool -- only "object" and "function".
       */
      function ResourcePool_getDefaultValidTargets() {
        return ['object', 'function'];
      }
    
      /**
       * @method DataAccessInterface.ResourcePool.create
       * @returns {ResourcePool}
       */
      function ResourcePool_create() {
        return new ResourcePool();
      }
    
      //FIXME make these to be instance modifiers, not global or both
      ResourcePool.isValidTarget = ResourcePool_isValidTarget;
      ResourcePool.setValidTargets = ResourcePool_setValidTargets;
      ResourcePool.getDefaultValidTargets = ResourcePool_getDefaultValidTargets;
      ResourcePool.create = ResourcePool_create;
      ResourcePool.Events = ResourcePoolEvents;
    
      // setting default valid targets
      ResourcePool.setValidTargets(ResourcePool.getDefaultValidTargets());
    
      return ResourcePool;
    })();
    
    'use strict';
    /**
     * @exports DataAccessInterface.ResourcePoolRegistry
     */
    
    /**
     * @typedef {Object} DataAccessInterface.ResourcePoolRegistry~Events
     * @property {string} RESOURCE_POOL_CREATED Event for created ResourcePool
     * @property {string} RESOURCE_POOL_REGISTERED Event for registered ResourcePool
     * @property {string} RESOURCE_POOL_REMOVED Event for removed ResourcePool
     */
    
    /**
     * @ignore
     */
    var ResourcePoolRegistry = (function() {
    
      /**
       * @member {DataAccessInterface.ResourcePoolRegistry~Events} DataAccessInterface.ResourcePoolRegistry.Events
       */
      var ResourcePoolRegistryEvents = Object.freeze({
        RESOURCE_POOL_CREATED: 'resourcePoolCreated',
        RESOURCE_POOL_REGISTERED: 'resourcePoolRegistered',
        RESOURCE_POOL_REMOVED: 'resourcePoolRemoved'
      });
    
      var POOLS_FIELD = Symbol('resource.pool.registry::pools');
    
      function _poolDestroyedListener(event) {
        this.remove(event.data);
      }
    
      /**
       * @constructor
       * @extends {DataAccessInterface.ResourcePool}
       * @private
       */
      function _DefaultResourcePool() {
        ResourcePool.apply(this);
        //INFO default ResourcePool should not be destroyable;
        this.destroy = function() {
          throw new Error('Default ResourcePool cannot be destroyed.');
        };
      }
    
      _DefaultResourcePool.prototype = ResourcePool.prototype;
    
      /**
       * @class DataAccessInterface.ResourcePoolRegistry
       * @extends EventDispatcher
       * @classdesc Collection of ResourcePool instances. Allows lookup for ResourcePool by its Id.
       * When ResourcePool is registered in ResourcePoolRegistry, it subscribes to ResourcePool POOL_DESTROYED event and removes pool from registry after its destroyed.
       */
      function ResourcePoolRegistry() {
        Object.defineProperty(this, POOLS_FIELD, {
          value: {}
        });
        EventDispatcher.apply(this);
        this._poolDestroyedListener = _poolDestroyedListener.bind(this);
        // every registry should keep default pool, so you can access from anywhere
        this.register(ResourcePoolRegistry.defaultResourcePool);
      }
    
      /**
       * Create and register ResourcePool
       * @returns {DataAccessInterface.ResourcePool} New ResourcePool instance
       */
      function _createPool() {
        var pool = ResourcePool.create();
        if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_CREATED)) {
          this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_CREATED, pool);
        }
        this.register(pool);
        return pool;
      }
    
      /**
       * Register ResourcePool instance.
       * @param pool {DataAccessInterface.ResourcePool} ResourcePool instance to be registered
       */
      function _register(pool) {
        if (this[POOLS_FIELD].hasOwnProperty(pool.id)) return;
        this[POOLS_FIELD][pool.id] = pool;
        pool.addEventListener(ResourcePool.Events.POOL_DESTROYED, this._poolDestroyedListener);
        if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_REGISTERED)) {
          this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_REGISTERED, pool);
        }
      }
    
      /**
       * Retrieve ResourcePool instance from registry by its Id.
       * @param poolId {String} ResourcePool instance Id
       * @returns {DataAccessInterface.ResourcePool|null}
       */
      function _get(poolId) {
        return this[POOLS_FIELD][poolId] || null;
      }
    
      /**
       * Check if ResourcePool registered in this registry instance.
       * @param pool {DataAccessInterface.ResourcePool|String} ResourcePool instance or its Id.
       * @returns {Boolean}
       */
      function _isRegistered(pool) {
        return this[POOLS_FIELD].hasOwnProperty(pool instanceof ResourcePool ? pool.id : String(pool));
      }
    
      /**
       * Remove ResourcePool from current registry instance.
       * @param pool {DataAccessInterface.ResourcePool|String} ResourcePool instance or its Id.
       * @returns {Boolean}
       */
      function _remove(pool) {
        var result = false;
        pool = pool instanceof ResourcePool ? pool : this.get(pool);
        if (pool) {
          pool.removeEventListener(ResourcePool.Events.POOL_DESTROYED, this._poolDestroyedListener);
          result = delete this[POOLS_FIELD][pool.id];
        }
        if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_REMOVED)) {
          this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_REMOVED, pool);
        }
        return result;
      }
    
      ResourcePoolRegistry.prototype = EventDispatcher.createNoInitPrototype();
      ResourcePoolRegistry.prototype.constructor = ResourcePoolRegistry;
      ResourcePoolRegistry.prototype.createPool = _createPool;
      ResourcePoolRegistry.prototype.register = _register;
      ResourcePoolRegistry.prototype.get = _get;
      ResourcePoolRegistry.prototype.isRegistered = _isRegistered;
      ResourcePoolRegistry.prototype.remove = _remove;
    
      //--------------- static
    
      /**
       * Create new instance of ResourcePoolRegistry.
       * @method DataAccessInterface.ResourcePoolRegistry.create
       * @returns {DataAccessInterface.ResourcePoolRegistry}
       */
      function ResourcePoolRegistry_create() {
        return new ResourcePoolRegistry();
      }
    
      ResourcePoolRegistry.create = ResourcePoolRegistry_create;
      ResourcePoolRegistry.Events = ResourcePoolRegistryEvents;
      /**
       * Default ResourcePool is created immediately after class initialization and available via ResourcePoolRegistry class, as static property.
       * Its used as default ResourcePool in `DataAccessInterface` if other not supplied.
       * Default ResourcePool cannot be destroyed, destroy() method call throws Error.
       * @member {DataAccessInterface.ResourcePool} DataAccessInterface.ResourcePoolRegistry.defaultResourcePool
       */
      ResourcePoolRegistry.defaultResourcePool = new _DefaultResourcePool();
    
      return ResourcePoolRegistry;
    })();
    
    'use strict';
    /**
     * @exports DataAccessInterface.ResourceConverter
     */
    
    /**
     * @typedef {Object} DataAccessInterface.ResourceConverter~Events
     * @property {string} RESOURCE_CREATED Event fired when RequestTarget created from RAWResource object
     * @property {string} RESOURCE_CONVERTED Event fired when resource created from target value
     */
    
    /**
     * @ignore
     */
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
       * @member {DataAccessInterface.ResourceConverter~Events} DataAccessInterface.ResourceConverter.Events
       */
      var ResourceConverterEvents = Object.freeze({
        RESOURCE_CREATED: 'resourceCreated',
        RESOURCE_CONVERTED: 'resourceConverted'
      });
    
      /**
       * @class DataAccessInterface.ResourceConverter
       * @classdesc Resource converter contains bunch of methods to lookup for resources and registering them, converting them into RAWResource or into RequestTargets, depending on their origin.
       * Before sending data, bundled resources should be registered in ResourcePool and then converted to RAWResource objects.
       * After data received, its RAWResources should be converted to RequestTargets for not resolved resources or to resource target values otherwise.
       * Resource can be resolved by its `id` and `poolId`, if ResourceConverter can find ResourcePool with id from poolId, it will try to get target resource value and
       * replace with it RAWResource object. It ResourcePool not found, ResourceConverter assumes that resource come from other origin/environment and
       * creates RequestTarget object that can be target object for commands.
       * ResourceConverter while handling data does not look deeply, so its developer responsibility to convert deeply nested resource targets.
       * @param {RequestFactory} factory
       * @param {DataAccessInterface.ResourcePoolRegistry} registry
       * @param {DataAccessInterface.ResourcePool} pool
       * @param {RequestHandlers} handlers
       * @extends EventDispatcher
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
    
      /**
       * @method DataAccessInterface.ResourceConverter#resourceToObject
       * @param {*} data
       * @returns {*}
       */
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
    
      /**
       * @method DataAccessInterface.ResourceConverter#objectToResource
       * @param {*} data
       * @returns {*}
       * @private
       */
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
    
      /**
       * @method DataAccessInterface.ResourceConverter#lookupArray
       * @param list
       * @param linkConvertHandler
       * @returns {Array}
       * @private
       */
      function _lookupArray(list, linkConvertHandler) {
        var result = [];
        var length = list.length;
        for (var index = 0; index < length; index++) {
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
      function _lookupObject(data, linkConvertHandler) {
        var result = {};
        for (var name in data) {
          if (!data.hasOwnProperty(name)) continue;
          result[name] = linkConvertHandler.call(this, data[name]);
        }
        return result;
      }
    
      /**
       * @method DataAccessInterface.ResourceConverter#toJSON
       * @param {*} data
       * @returns {*}
       * @private
       */
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
    
      /**
       * @method DataAccessInterface.ResourceConverter#parse
       * @param {*} data
       * @returns {*}
       * @private
       */
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
    
      /**
       * @method DataAccessInterface.ResourceConverter#lookupForPending
       * @param {*} data
       * @returns {Array}
       */
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
       * @method DataAccessInterface.ResourceConverter.create
       * @param {RequestFactory} factory
       * @param {DataAccessInterface.ResourcePoolRegistry} registry
       * @param {DataAccessInterface.ResourcePool} pool
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
    /**
     * @exports RequestHandlers
     */
    /**
     * @ignore
     */
    var RequestHandlers = (function() {
    
      var RequestHandlersEvents = Object.freeze({
        HANDLERS_UPDATED: 'handlersUpdated'
      });
    
      /**
       * @class RequestHandlers
       * @param {boolean} proxyEnabled
       * @private
       */
      function RequestHandlers(proxyEnabled) {
        var _keys = [];
        var _propertyKeys = [];
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
          _propertyKeys = getNonVirtualNames(_descriptors, _keys);
          if (proxyEnabled) {
            RequestHandlers.areProxyHandlersAvailable(_descriptors, true);
          }
        }
    
        function _hasHandler(name) {
          return _descriptors.hasOwnProperty(name);
        }
    
        function _getHandlers() {
          return _descriptors;
        }
    
        function _getHandlerNames() {
          return _keys.slice();
        }
    
        function _getPropertyNames() {
          return _propertyKeys.slice();
        }
    
        function _getHandler(name) {
          return _descriptors[name] || null;
        }
    
        function _handle(parentRequest, name, pack, deferred, resultRequest) {
          var list = _converter ? _converter.lookupForPending(pack.value) : null;
          if (list && list.length) {
            // FIXME Need to test on all platforms: In other browsers this might not work because may need list of Promise objects, not RequestTargets
            Promise.all(list).then(function() {
              _handleImmediately(parentRequest, name, pack, deferred, resultRequest);
            });
          } else {
            _handleImmediately(parentRequest, name, pack, deferred, resultRequest);
          }
        }
    
        function _handleImmediately(parentRequest, name, data, deferred, resultRequest) {
          var handler = _getHandler(name);
          if (handler instanceof CommandDescriptor) {
            //INFO result should be applied to deferred.resolve() or deferred.reject()
            handler.handle(parentRequest, data, deferred, resultRequest);
          } else {
            throw new Error('Command descriptor for "' + name + '" was not found.');
          }
    
        }
    
        this.setConverter = _setConverter;
        /**
         * @param {DataAccessInterface.CommandDescriptor[]|Object.<string, Function|DataAccessInterface.CommandDescriptor>} handlers
         */
        this.setHandlers = _setHandlers;
        this.hasHandler = _hasHandler;
        this.getHandlers = _getHandlers;
        this.getHandlerNames = _getHandlerNames;
        this.getPropertyNames = _getPropertyNames;
        this.getHandler = _getHandler;
        this.handle = _handle;
        this[Symbol.iterator] = function() {
          return new RequestHandlersIterator(this.getHandlers(), this.getPropertyNames());
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
    
      function getNonVirtualNames(descriptors, list) {
        var props = [];
        var length = list.length;
        for (var index = 0; index < length; index++) {
          var name = list[index];
          if (!descriptors[name].virtual) {
            props.push(name);
          }
        }
        return props;
      }
    
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
          if (!handlers) return;
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
    
    /**
     * @ignore
     */
    var CommandHandlerFactory = (function() {
      /**
       * @constructor
       * @private
       */
      function CommandHandlerFactory() {
        var _members = new Map();
        var _factory;
    
        /**
         * @param {CommandDescriptor} descriptor
         * @returns {Function}
         * @private
         */
        function _get(descriptor) {
          var propertyName = descriptor.name;
          if (!_members.has(propertyName)) {
            _members.set(propertyName, _create(descriptor.name, descriptor.type, descriptor.isTemporary, descriptor.cacheable));
          }
          return _members.get(propertyName);
        }
    
        function _create(propertyName, commandType, isTemporary, cacheable) {
    
          function _commandHandler(command, value) {
            var result;
            var promise;
            if (this[TARGET_INTERNALS]) {
              var pack = RequestTargetInternals.createRequestPackage(commandType, arguments, this[TARGET_INTERNALS].id);
              var request = getChildRequest(propertyName, pack, cacheable);
              result = request.child;
              if (request.deferred) {
                promise = this[TARGET_INTERNALS].sendRequest(propertyName, pack, request.deferred, result);
                if (!promise) {
                  result = null;
                }
                promise = checkState(promise, isTemporary, this, result, pack);
              }
            } else {
              promise = Promise.reject(new Error('Target object is not a resource, so cannot be used for calls.'));
            }
            return result || _factory.create(promise);
          }
    
          return _commandHandler;
        }
    
        function getChildRequest(propertyName, pack, cacheable) {
          var child, deferred;
          if (cacheable) {
            child = _factory.getCached(propertyName, pack);
          }
          if (!child) {
            deferred = createDeferred();
            if (cacheable) {
              child = _factory.createCached(deferred.promise, propertyName, pack);
            } else {
              child = _factory.create(deferred.promise, propertyName, pack);
            }
          }
          return {child: child, deferred: deferred};
        }
    
        function checkState(promise, isTemporary, parentRequest, childRequest, pack) {
          if (promise) {
            promise.then(function(data) {
              RequestTarget.setTemporary(childRequest, Boolean(isTemporary(parentRequest, childRequest, pack, data)));
            });
          } else {
            promise = Promise.reject(new Error('Initial request failed and didn\'t result in promise.'));
          }
          return promise;
        }
    
        function _setFactory(factory) {
          _factory = factory;
        }
    
        this.get = _get;
    
        this.setFactory = _setFactory;
      }
    
      return CommandHandlerFactory;
    })();
    
    'use strict';
    /**
     * @exports RequestTargetDecorator
     */
    
    /**
     * @ignore
     */
    var RequestTargetDecorator = (function() {
    
      /**
       * @class RequestTargetDecorator
       * @param {RequestFactory} _factory
       * @param {RequestHandlers} _handlers
       * @private
       */
      function RequestTargetDecorator(_factory, _handlers) {
    
        var _members = new CommandHandlerFactory();
        _members.setFactory(_factory);
    
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
            request[descriptor.name] = _members.get(descriptor);
          }
          return request;
        }
    
        function _setFactory(factory) {
          if (factory) {
            _members.setFactory(factory);
          }
        }
    
        this.apply = _apply;
        this.setFactory = _setFactory;
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
    /**
     * @export RequestFactory
     */
    
    var FACTORY_DECORATOR_FIELD = Symbol('request.factory::decorator');
    
    var FACTORY_HANDLERS_FIELD = Symbol('request.factory::handlers');
    
    /**
     * @ignore
     */
    var RequestFactory = (function() {
      var NOINIT = {};
      /*
       function DummyCacheImpl() {
       this.get = function(name, pack) {
    
       };
       this.set = function(name, pack, request) {
    
       };
       }
       */
      /**
       * @class RequestFactory
       * @param handlers
       * @param {ICacheImpl} _cacheImpl
       * @private
       */
      function RequestFactory(handlers, _cacheImpl) {
        if (handlers === NOINIT) {
          return;
        }
        this[FACTORY_HANDLERS_FIELD] = handlers;
        this[FACTORY_DECORATOR_FIELD] = RequestTargetDecorator.create(this, handlers);
    
        Object.defineProperties(this, {
          cache: {
            value: _cacheImpl || null
          }
        });
      }
    
      function _create(promise) {
        var request = RequestTarget.create(promise, this[FACTORY_HANDLERS_FIELD]);
        if (this[FACTORY_HANDLERS_FIELD].available) {
          this[FACTORY_DECORATOR_FIELD].apply(request);
        }
        return request;
      }
    
      function _getCached(name, pack) {
        return this.cache && this.cache.get(name, pack);
      }
    
      function _createCached(promise, name, pack) {
        var request = null;
        if(this.cache){
          request = this.create(promise);
          this.cache.set(name, pack, request);
        }
        return request;
      }
    
      RequestFactory.prototype.create = _create;
      RequestFactory.prototype.getCached = _getCached;
      RequestFactory.prototype.createCached = _createCached;
    
      //------------------- static
    
      function RequestFactory_create(handlers, cacheImpl) {
        return new RequestFactory(handlers, cacheImpl);
      }
    
      function RequestFactory_createNoInitPrototype() {
        return new RequestFactory(NOINIT);
      }
    
      RequestFactory.create = RequestFactory_create;
    
      RequestFactory.createNoInitProtoype = RequestFactory_createNoInitPrototype;
    
      return RequestFactory;
    })();
    
    'use strict';
    /**
     * @exports RequestProxyFactory
     */
    
    /**
     * @ignore
     */
    var RequestProxyFactory = (function() {
    
      var FACTORY_FIELD = Symbol('request.proxy.factory::factory');
    
      var EXCLUSIONS = {
        /*
         INFO arguments and caller were included because they are required function properties
         https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/arguments
         */
        'arguments': true,
        'caller': true,
        'prototype': true
      };
    
      function applyProxy(target, handlers) {
        function RequestTargetProxy() {
        }
    
        RequestTargetProxy.target = target;
        return new Proxy(RequestTargetProxy, handlers);
      }
    
      function Proxy_set(wrapper, name, value) {
        var result;
        var target = wrapper.target;
        if (name in target || name in EXCLUSIONS || typeof(name) === 'symbol') {
          result = target[name] = value;
        } else {
          result = target[ProxyCommands.fields.set](name, value);
        }
        return result;
      }
    
      function Proxy_has(wrapper, name) {
        return wrapper.target.hasOwnProperty(name);
      }
    
      function Proxy_deleteProperty(wrapper, name) {
        var result = false;
        var target = wrapper.target;
        if (ProxyCommands.fields.deleteProperty in target) {
          target[ProxyCommands.fields.deleteProperty](name);
          result = true;
        }
        return result;
      }
    
      function Proxy_ownKeys() {
        return Object.getOwnPropertyNames(EXCLUSIONS);
      }
    
      function Proxy_enumerate() {
        return Object.getOwnPropertyNames(EXCLUSIONS)[Symbol.iterator]();
      }
    
      function Proxy_getOwnPropertyDescriptor(wrapper, name) {
        var descr;
        if (EXCLUSIONS.hasOwnProperty(name)) {
          descr = Object.getOwnPropertyDescriptor(wrapper, name);
        } else {
          descr = Object.getOwnPropertyDescriptor(wrapper.target, name);
        }
        return descr;
      }
    
      /**
       * Builds proper handlers hash for Proxy
       * @returns {Function}
       */
      function createHandlers() {
        var handlers;
    
        function Proxy_get(wrapper, name) {
          var value;
          var target = wrapper.target;
          if (name in target || name in EXCLUSIONS || typeof(name) === 'symbol') {
            value = target[name];
          } else {
            value = target[ProxyCommands.fields.get](name);
            /* this makes double proxying, since its create()d with proxy already
            value = applyProxy(
              target[ProxyCommands.fields.get](name),
              handlers
            );
            */
          }
          return value;
        }
    
        function Proxy_apply(wrapper, thisValue, args) {
          return wrapper.target[ProxyCommands.fields.apply](null, args);
          /* this makes double proxying, since its create()d with proxy already
          return applyProxy(
            //INFO type is null because target is function we are calling now,
            // thisValue is being ignored for now
            wrapper.target[ProxyCommands.fields.apply](null, args),
            handlers
          );
          */
        }
    
        handlers = {
          'get': Proxy_get,
          'apply': Proxy_apply,
          'set': Proxy_set,
          'has': Proxy_has,
          'deleteProperty': Proxy_deleteProperty,
          'ownKeys': Proxy_ownKeys,
          'enumerate': Proxy_enumerate,
          'getOwnPropertyDescriptor': Proxy_getOwnPropertyDescriptor
        };
    
        return handlers;
      }
    
      var PROXY_HANDLERS = createHandlers();
    
      /**
       * @class RequestProxyFactory
       * @param handlers
       * @param cacheImpl
       * @private
       */
      function RequestProxyFactory(handlers, cacheImpl) {
        this[FACTORY_HANDLERS_FIELD] = handlers;
        this[FACTORY_FIELD] = RequestFactory.create(handlers, cacheImpl);
        this[FACTORY_FIELD][FACTORY_DECORATOR_FIELD].setFactory(this);
      }
    
      function _create(promise) {
        var instance = this[FACTORY_FIELD].create(promise);
        if (this[FACTORY_HANDLERS_FIELD].available) {
          instance = applyProxy(instance, PROXY_HANDLERS);
        }
        return instance;
      }
    
      function _getCached(name, pack) {
        return this[FACTORY_FIELD].getCached(name, pack);
      }
    
      function _createCached(promise, name, pack) {
        var instance = this[FACTORY_FIELD].createCached(promise, name, pack);
        if (this[FACTORY_HANDLERS_FIELD].available) {
          instance = applyProxy(instance, PROXY_HANDLERS);
        }
        return instance;
      }
    
      RequestProxyFactory.prototype = RequestFactory.createNoInitProtoype();
      RequestProxyFactory.prototype.constructor = RequestProxyFactory;
      RequestProxyFactory.prototype.create = _create;
      RequestProxyFactory.prototype.getCached = _getCached;
      RequestProxyFactory.prototype.createCached = _createCached;
    
      //------------------- static
    
      function RequestProxyFactory_applyProxy(target) {
        return applyProxy(target, PROXY_HANDLERS);
      }
    
      function RequestProxyFactory_create(handlers, cacheImpl) {
        return new RequestProxyFactory(handlers, cacheImpl);
      }
    
      RequestProxyFactory.create = RequestProxyFactory_create;
      RequestProxyFactory.applyProxy = RequestProxyFactory_applyProxy;
    
      return RequestProxyFactory;
    })();
    
    'use strict';
    /**
     * @exports RequestTargetInternals
     */
    
    /**
     * @ignore
     */
    var RequestTargetInternals = (function() {
    
      /**
       * @class RequestTargetInternals
       * @param {DataAccessInterface.RequestTarget} _requestTarget
       * @param {Promise} _promise
       * @param {RequestHandlers} _requestHandlers
       * @mixin Promise
       * @private
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
          /**
           * @member {?string} RequestTargetInternals#poolId
           * @readonly
           */
          poolId: {
            get: get_poolId
          },
          /**
           * @member {?string} RequestTargetInternals#type
           * @readonly
           */
          type: {
            get: get_type
          },
          /**
           * @member {?string} RequestTargetInternals#id
           * @readonly
           */
          id: {
            get: get_id
          }
        });
    
        _promise.then(
          _resolveHandler.bind(this),
          _rejectHandler.bind(this)
        );
      }
    
      /**
       * @private
       */
      function get_poolId() {
        return this.link.poolId || null;
      }
    
      /**
       * @private
       */
      function get_type() {
        return this.link.type || null;
      }
    
      /**
       * @private
       */
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
          var child = request[3];
          pack.target = this.link.id;
          this._handleRequest(name, pack, deferred, child);
        }
        this.queue = null;
      }
    
      function _rejectQueue(message) {
        var error = new Error(message || 'This request was rejected before sending.');
        while (this.queue && this.queue.length) {
          /**
           * @type {Array.<string, CommandDataPack, DataAccessInterface.Deferred>}
           */
          //FIXME [string, {type:string, cmd:string, value:*, target:string}, Deferred] -- how to describe this in JSDoc?
          var request = this.queue.shift();
          request[2].reject(error);
        }
        this.queue = null;
      }
    
      function _sendRequest(name, pack, deferred, child) {
        var promise = null;
        if (this.requestHandlers.hasHandler(name)) {
          promise = this._applyRequest(name, pack, deferred || createDeferred(), child);
        } else {
          throw new Error('Request handler for "' + name + '" is not registered.');
        }
        if (child) {
          this.registerChild(child);
        }
        return promise;
      }
    
      function _addToQueue(name, pack, deferred, child) {
        this.queue.push([name, pack, deferred, child]);
      }
    
    
      function _applyRequest(name, pack, deferred, child) {
        var promise = deferred.promise;
        switch (this.status) {
          case TargetStatus.PENDING:
            this._addToQueue(name, pack, deferred, child);
            break;
          case TargetStatus.REJECTED:
            promise = Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
            break;
          case TargetStatus.DESTROYED:
            promise = Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
            break;
          case TargetStatus.RESOLVED:
            this._handleRequest(name, pack, deferred, child);
            break;
        }
        return promise;
      }
    
      function _handleRequest(name, pack, deferred, child) {
        this.requestHandlers.handle(this.requestTarget, name, pack, deferred, child);
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
            promise = this.sendRequest(RequestTargetCommands.fields.DESTROY, RequestTargetInternals.createRequestPackage(
              RequestTargetCommands.DESTROY, [null, null], this.id
            ));
          } else {
            promise = Promise.resolve();
          }
          this.status = TargetStatus.DESTROYED;
        } else {
          promise = Promise.reject(new Error('Invalid or already destroyed target.'));
        }
        return promise;
      }
    
      /**
       * @method RequestTargetInternals#then
       * @param {Function} [resolveHandler]
       * @param {Function} [rejectHandler]
       * @returns {Promise}
       */
      function _then() {
        var child = this.promise.then.apply(this.promise, arguments);
        if (child) {
          this.hadChildPromises = true;
        }
        return child;
      }
    
      /**
       * @method RequestTargetInternals#catch
       * @param {Function} [rejectHandler]
       * @returns {Promise}
       */
      function _catch() {
        var child = this.promise.catch.apply(this.promise, arguments);
        if (child) {
          this.hadChildPromises = true;
        }
        return child;
      }
    
      /**
       * @method RequestTargetInternals#toJSON
       * @returns {RAWResource}
       */
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
    
      /**
       * @member {RequestTargetInternals.createRequestPackage}
       * @param {string} type
       * @param {Arguments} args
       * @param {string} targetId
       * @returns {{type: string, cmd: string, value: *, target: string, args: Arguments}}
       */
      function _createRequestPackage(type, args, targetId) {
        var result = {
          type: type,
          cmd: args[0], //cmd,
          value: args[1], //value,
          target: targetId
        };
        Object.defineProperty(result, 'args', {
          value: args
        });
        return result;
      }
    
      RequestTargetInternals.createRequestPackage = _createRequestPackage;
    
      return RequestTargetInternals;
    })();
    
    'use strict';
    /**
     * @exports DataAccessInterface.RequestTarget
     */
    /**
     * @ignore
     */
    var RequestTarget = (function() {
    
      var PROMISE_FIELD = Symbol('request.target::promise');
    
      /**
       * The object that will be available on other side
       * @class DataAccessInterface.RequestTarget
       * @param _promise {Promise}
       * @param _requestHandlers {RequestHandlers}
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
        var list = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].queue : null;
        return list ? list.length : 0;
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
    
      function RequestTarget_getLastChild(target) {
        var list = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].children : null;
        return list && list.length ? list[list.length-1] : null;
      }
    
      function RequestTarget_getChildrenCount(target) {
        var list = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].children : null;
        return list ? list.length : 0;
      }
    
      function RequestTarget_sendRequest(target) {
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
      RequestTarget.getLastChild = RequestTarget_getLastChild;
      RequestTarget.getChildrenCount = RequestTarget_getChildrenCount;
      RequestTarget.create = RequestTarget_create;
    
      return RequestTarget;
    })();
    
    'use strict';
    /**
     * @exports DataAccessInterface
     */
    /**
     * @ignore
     */
    var DataAccessInterface = (function() {
    
      /**
       * @class DataAccessInterface
       * @classdesc Facade of Deferred Data Access library, it holds all of public API -- objects like ResourcePool and methods to work with resources.
       * @param {DataAccessInterface.CommandDescriptor[]|Object.<string, Function|DataAccessInterface.CommandDescriptor>} handlers
       * @param {boolean} [proxyEnabled=false]
       * @param {ResourcePoolRegistry} [poolRegistry]
       * @param {ResourcePool} [pool]
       * @param {ICacheImpl} [cacheImpl]
       */
      function DataAccessInterface(handlers, proxyEnabled, _poolRegistry, _pool, _cacheImpl) {
        proxyEnabled = Boolean(proxyEnabled);
        if (proxyEnabled && !areProxiesAvailable()) {
          throw new Error('Proxies are not available in this environment');
        }
        var _handlers = RequestHandlers.create(proxyEnabled);
        var _factory = (proxyEnabled ? RequestProxyFactory : RequestFactory).create(_handlers, _cacheImpl);
        _poolRegistry = _poolRegistry || ResourcePoolRegistry.create();
        if (_pool) {
          _poolRegistry.register(_pool);
        } else if (_pool !== undefined) {
          _pool = _poolRegistry.createPool();
        } else {
          _pool = ResourcePoolRegistry.defaultResourcePool;
        }
        Object.defineProperties(this, {
          /**
           * @member {ResourcePoolRegistry} DataAccessInterface#poolRegistry
           * @readonly
           */
          poolRegistry: {
            value: _poolRegistry
          },
          /**
           * @member {ResourcePool} DataAccessInterface#pool
           * @readonly
           */
          pool: {
            get: function() {
              return _pool;
            }
          },
          /**
           * @member {ResourceConverter} DataAccessInterface#resourceConverter
           * @readonly
           */
          resourceConverter: {
            value: ResourceConverter.create(_factory, _poolRegistry, _pool, _handlers)
          },
          /**
           * @member {RequestFactory} DataAccessInterface#factory
           * @readonly
           */
          factory: {
            value: _factory
          },
          /**
           * @member {boolean} DataAccessInterface#proxyEnabled
           * @readonly
           */
          proxyEnabled: {
            get: function() {
              return _handlers.proxyEnabled;
            }
          }
        });
    
        function poolDestroyedHandler() {
          _pool.removeEventListener(ResourcePool.Events.POOL_DESTROYED, poolDestroyedHandler);
          _pool = _poolRegistry.createPool();
          _pool.addEventListener(ResourcePool.Events.POOL_DESTROYED, poolDestroyedHandler);
        }
    
        _handlers.setHandlers(handlers);
        _pool.addEventListener(ResourcePool.Events.POOL_DESTROYED, poolDestroyedHandler);
      }
    
      function _parse(data) {
        return this.resourceConverter.parse(data);
      }
    
      function _toJSON(data) {
        return this.resourceConverter.toJSON(data);
      }
    
      function _isOwnResource(resource) {
        /**
         * @type {boolean|undefined}
         */
        var result;
        /**
         * @type {DataAccessInterface.ResourcePool}
         */
        var pool;
        if (isResource(resource)) {
          pool = this.poolRegistry.get(getResourcePoolId(resource));
          result = pool && pool.has(getResourceId(resource));
        }
        return result;
      }
    
      /**
       * @method DataAccessInterface#parse
       * @param {Object|string} data
       * @returns {Object}
       */
      DataAccessInterface.prototype.parse = _parse;
    
      /**
       * @method DataAccessInterface#toJSON
       * @param {Object} data
       * @returns {Object}
       */
      DataAccessInterface.prototype.toJSON = _toJSON;
    
      /**
       * Check if resource belongs to DataAccessInterface instance.
       * @method DataAccessInterface#isOwnResource
       * @param {RAWResource|TargetResource|RequestTarget} resource
       * @returns {Object}
       */
      DataAccessInterface.prototype.isOwnResource = _isOwnResource;
    
      //------------------ static
    
      function DataAccessInterface_create(handlers, proxyEnabled, poolRegistry, pool, cacheImpl) {
        return new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);
      }
    
      /**
       * @method DataAccessInterface.create
       * @param {CommandDescriptor[]|Object.<string, Function|CommandDescriptor>} handlers
       * @param {boolean} [proxyEnabled=false]
       * @param {ResourcePoolRegistry} [poolRegistry]
       * @param {ResourcePool} [pool]
       * @param {ICacheImpl} [cacheImpl]
       * @returns {DataAccessInterface}
       */
      DataAccessInterface.create = DataAccessInterface_create;
      /**
       * @method DataAccessInterface.createDeferred
       * @returns {Deferred}
       */
      DataAccessInterface.createDeferred = createDeferred;
      // ---- classes
      DataAccessInterface.IConvertible = IConvertible;
      DataAccessInterface.RequestTarget = RequestTarget;
      DataAccessInterface.Deferred = Deferred;
      DataAccessInterface.CommandDescriptor = CommandDescriptor;
      DataAccessInterface.ResourcePool = ResourcePool;
      DataAccessInterface.ResourcePoolRegistry = ResourcePoolRegistry;
      DataAccessInterface.ResourceConverter = ResourceConverter;
      // ---- namespaces
      DataAccessInterface.Reserved = Reserved;
      DataAccessInterface.RequestTargetCommands = RequestTargetCommands;
      DataAccessInterface.ProxyCommands = ProxyCommands;
      // ---- functions
      DataAccessInterface.getRAWResource = getRAWResource;
      DataAccessInterface.getResourceData = getResourceData;
      DataAccessInterface.getResourceId = getResourceId;
      DataAccessInterface.getResourcePoolId = getResourcePoolId;
      DataAccessInterface.getResourceType = getResourceType;
      DataAccessInterface.createForeignResource = createForeignResource;
      DataAccessInterface.isResource = isResource;
      DataAccessInterface.isResourceConvertible = isResourceConvertible;
      DataAccessInterface.areSameResource = areSameResource;
    
      return DataAccessInterface;
    })();
    
    
    return DataAccessInterface;
  })();
  
  return DataAccessInterface;
}));
