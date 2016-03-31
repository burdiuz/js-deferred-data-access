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
