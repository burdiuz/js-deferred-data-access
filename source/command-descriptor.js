'use strict';
/**
 * @exports DataAccessInterface.CommandDescriptor
 * @exports DataAccessInterface.RequestTargetCommands
 * @exports DataAccessInterface.ProxyCommands
 * @exports DataAccessInterface.Reserved
 */

/**
 * @callback DataAccessInterface.CommandDescriptor~handler
 * @param {DataAccessInterface.RequestTarget} parentRequest
 * @param {CommandDataPack} pack
 * @param {DataAccessInterface.Deferred} deferred
 * @param {DataAccessInterface.RequestTarget} [resultRequest]
 * @returns {void}
 */

/**
 * @callback CommandDescriptorGenerator
 * @param {Function} handler
 * @param {Object|Array} target
 * @param {Function} [isTemporary=null]
 * @param {String} [resourceType=null]
 * @param {Boolean} [cacheable=false]
 * @returns {DataAccessInterface.CommandDescriptor}
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
 * @callback DataAccessInterface.CommandDescriptor~resourceType
 * @param {DataAccessInterface.RequestTarget} parentRequest
 * @param {CommandDataPack} pack
 * @returns {String|null}
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
   * @class DataAccessInterface.CommandDescriptor
   * @classdesc CommandDescriptor represents command that should be executed on resource object.
   * Each CommandDescriptor must describe property name, command type and handler function that will be called when command should be executed.
   * When new resource parsed from RAW object, it will be converted to RequestTarget.
   * Each RequestTarget object is decorated with methods named by `CommandDescriptor.name`.
   * Calling this method will start `CommandDescriptor.type` command execution and immediately returns a Promise that should be resolved in `CommandDescriptor.handle`.
   * Optionally isTemporary, cacheable and virtual parameters may be supplied.
   * @param {String|Object} type Command type
   * @param {DataAccessInterface.CommandDescriptor~handler} handler Command handle function
   * @param {String|Symbol} [name] Method name
   */
  function CommandDescriptor(type, handler, name) {
    /**
     * Property name that will be used to place command handler function into RequestTarget.
     * If name was not provided, command type string will be used instead.
     * It is allowed to have multiple CommandDescriptors for same command type but with different property names.
     * @member {String|Symbol} DataAccessInterface.CommandDescriptor#name
     */
    this.name = name !== undefined ? name : type;
    /**
     * Command type, it will be passed to handler
     * @member {String|Object} DataAccessInterface.CommandDescriptor#type
     */
    this.type = type;
    /**
     * Handler function, it will be called each time when RequestTarget[name]() executed
     * @member {DataAccessInterface.CommandDescriptor~handler} DataAccessInterface.CommandDescriptor#handler
     */
    this.handler = handler;
    /**
     * This callback must return true if RequestTarget should be destroyed after resolving promise passed to handler function.
     * This function will be called for generated resource on command call, before its resolved.
     * @member {?DataAccessInterface.CommandDescriptor~isTemporary} DataAccessInterface.CommandDescriptor#isTemporary
     * @default null
     */
    this.isTemporary = null;
    /**
     * If true and ICacheImpl instance was provided, RequestTarget will be passed to ICacheImpl. By default, false.
     * @member {boolean} DataAccessInterface.CommandDescriptor#cacheable
     * @default false
     */
    this.cacheable = false;
    /**
     * If true, command handler will not be created on RequestTarget instance. So it can be called only using internal methods. By default, false.
     * @member {boolean} DataAccessInterface.CommandDescriptor#virtual
     * @default false
     */
    this.virtual = false;

    /**
     * If handler should result with a resource, you may specify supposed resource type so appropriate handlers may be applied asap after resource creation.
     * @type {?String|DataAccessInterface.CommandDescriptor~resourceType}
     * @default null
     */
    this.resourceType = null;
  }

  // Since its VO it should not contain any methods that may change its internal state

  //---------------

  /**
   * Creates immutable CommandDescriptor instance. It is strongly recommended to use CommandDescriptor.create() instead of using "new" operator.
   * @method DataAccessInterface.CommandDescriptor.create
   * @param {string} command
   * @param {Function} handler
   * @param {string} [name=]
   * @returns {DataAccessInterface.CommandDescriptor}
   */
  function CommandDescriptor_create(command, handler, name) {
    var descriptor = new CommandDescriptor(command, handler, name);
    // We can use Object.freeze(), it keeps class/constructor information
    return Object.freeze(descriptor);
  }

  CommandDescriptor.create = CommandDescriptor_create;

  return CommandDescriptor;
})();

/**
 * Store CommandDescriptor in an Object hash or Array list
 * @param {DataAccessInterface.CommandDescriptor} descriptor
 * @param {Array|Object} target
 * @private
 */
function addDescriptorTo(descriptor, target) {
  if (target instanceof Array) {
    target.push(descriptor);
  } else if (target) {
    target[descriptor.name] = descriptor;
  }
}

/**
 * Generate factory method for creating custom CommandDescriptor's
 * @param {String} command
 * @param {String} [name]
 * @returns {CommandDescriptorGenerator}
 * @private
 */
function descriptorGeneratorFactory(command, name) {
  return function descriptorSetter(handler, target, isTemporary, resourceType, cacheable) {
    var descriptor = new CommandDescriptor(command, handler, name);
    descriptor.isTemporary = isTemporary;
    descriptor.resourceType = resourceType;
    descriptor.cacheable = cacheable;
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };
}

/**
 * Destroy is unique type that exists for every RequestTarget and does not have a method on its instances.
 * This type will be send each time RequestTarget.destroy() is applied to RequestTarget in stance.
 * @namespace {Object} DataAccessInterface.RequestTargetCommands
 */
var RequestTargetCommands = (function() {
  var DESTROY_FIELD = Symbol('::destroy.resource');
  var commands = {
    DESTROY: '::destroy.resource',
    fields: Object.freeze({
      DESTROY: DESTROY_FIELD
    })
  };
  /**
   * @member {Object} DataAccessInterface.RequestTargetCommands.createDESTROYDescriptor
   * @param {Function} handler
   * @param {Array|Object} [target]
   * @returns {DataAccessInterface.CommandDescriptor}
   */
  commands.createDESTROYDescriptor = function(handler, target) {
    var descriptor = new CommandDescriptor(commands.DESTROY, handler, commands.fields.DESTROY);
    descriptor.virtual = true;
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
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

  /**
   * @method DataAccessInterface.ProxyCommands.createDescriptors
   * @param {Object.<string, Function>} handlers
   * @param {Array|Object} target
   * @param {Function} [isTemporary=null]
   * @param {String} [resourceType=null]
   * @param {Boolean} [cacheable=false]
   * @returns {Array|Object}
   */
  function createDescriptors(handlers, target, isTemporary, resourceType, cacheable) {
    var handler, name, field, descriptor;
    var list = ProxyCommands.list;
    var length = list.length;
    target = target || {};
    for (var index = 0; index < length; index++) {
      name = list[index];
      handler = handlers[name];
      field = ProxyCommands.fields[name];
      if (handler instanceof Function) {
        descriptor = new CommandDescriptor(name, handler, field);
        descriptor.isTemporary = isTemporary;
        descriptor.resourceType = resourceType;
        descriptor.cacheable = cacheable;
        descriptor = Object.freeze(descriptor);
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

  /**
   * @member {CommandDescriptorGenerator} DataAccessInterface.ProxyCommands.createGETDescriptor
   */
  commands.createGETDescriptor = descriptorGeneratorFactory(commands.GET, commands.fields.get);

  /**
   * @member {CommandDescriptorGenerator} DataAccessInterface.ProxyCommands.createSETDescriptor
   */
  commands.createSETDescriptor = descriptorGeneratorFactory(commands.SET, commands.fields.set);

  /**
   * @member {CommandDescriptorGenerator} DataAccessInterface.ProxyCommands.createAPPLYDescriptor
   */
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
