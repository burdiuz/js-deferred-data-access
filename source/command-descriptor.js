'use strict';
var CommandDescriptor = (function() {

  /**
   * @returns {boolean}
   */
  function Default_isTemporary() {
    return false;
  }

  /**
   * Immutable
   * @param {String|Object} type
   * @param {Function} handle
   * @param {String|Symbol} [name=]
   * @param {Function} [isTemporary=]
   * @constructor
   */
  function CommandDescriptor(type, handle, name, isTemporary, cacheable) {
    /**
     * @type {String|Symbol}
     */
    this.name = name !== undefined ? name : type;
    /**
     * @type {String|Object}
     */
    this.type = type;
    /**
     * @type {Function}
     */
    this.handle = handle;
    /**
     * @type {Function}
     */
    this.isTemporary = isTemporary || Default_isTemporary;

    this.cacheable = Boolean(cacheable);
  }

  // Since its VO it should not contain any methods that may change its internal state

  //---------------

  /**
   *
   * @param {string} command
   * @param {Function} handle
   * @param {string} [name=]
   * @param {Function} [isTemporary=]
   * @param {Boolean} [cacheable=false]
   * @returns {CommandDescriptor}
   */
  function CommandDescriptor_create(command, handle, name, isTemporary, cacheable) {
    var descriptor = new CommandDescriptor(command, handle, name, isTemporary, cacheable);
    // We can use Object.freeze(), it keeps class/constructor information
    return Object.freeze(descriptor);
  }

  CommandDescriptor.create = CommandDescriptor_create;

  return CommandDescriptor;
})();

function descriptorGeneratorFactory(command, name) {
  return function descriptorSetter(handle, isTemporary, target) {
    var descriptor = CommandDescriptor.create(command, handle, name, isTemporary);
    if (target instanceof Array) {
      target.push(descriptor);
    } else if (target) {
      target[name] = descriptor;
    }
    return descriptor;
  }
}

/**
 * Destroy is unique type that exists for every RequestTarget and does not have a method on its instances.
 * This type will be send each time RequestTarget.destroy() is applied to RequestTarget in stance.
 * @type {Object}
 */
var RequestTargetCommands = Object.freeze({
  DESTROY: '::destroy.resource'
});

/**
 * Commands used by Proxy wrapper to get/set properties and call functions/methods.
 * @type {Object}
 */
var ProxyCommands = (function() {
  var GET_FIELD = Symbol('proxy.commands::get');
  var SET_FIELD = Symbol('proxy.commands::set');
  var APPLY_FIELD = Symbol('proxy.commands::apply');
  var DELETE_PROPERTY_FIELD = Symbol('proxy.commands::deleteProperty');

  var commands = {
    GET: 'get',
    SET: 'set',
    APPLY: 'apply',
    DELETE_PROPERTY: 'deleteProperty'
  };
  commands.fields = Object.freeze({
    get: GET_FIELD,
    set: SET_FIELD,
    apply: APPLY_FIELD,
    deleteProperty: DELETE_PROPERTY_FIELD
  });

  function get_list() {
    return [commands.GET, commands.SET, commands.APPLY, commands.DELETE_PROPERTY];
  }

  function get_required() {
    return [commands.GET, commands.SET, commands.APPLY];
  }

  function createDescriptors(handlers, isTemporary, target) {
    var handler, name, field, descriptor;
    var list = ProxyCommands.list;
    var length = list.length;
    target = target || {};
    for (var index = 0; index < length; index++) {
      name = list[index];
      handler = handlers[name];
      field = ProxyCommands.fields[name];
      if (handler instanceof Function) {
        descriptor = CommandDescriptor.create(name, handler, field, isTemporary);
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
    list: {
      get: get_list
    },
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


var Reserved = Object.freeze({
  names: Object.freeze({
    //INFO Exposed Promise method, cannot be overwritten by type
    then: true,
    //INFO Exposed Promise method, cannot be overwritten by type
    catch: true
  }),
  commands: Object.freeze({
    '::destroy.resource': true
  })
});
