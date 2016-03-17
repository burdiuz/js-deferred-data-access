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
   * @param {String|Symbol} name
   * @param {Function} handle
   * @param {String|Object} [type]
   * @param {Function} [isTemporary]
   * @constructor
   */
  function CommandDescriptor(name, handle, type, isTemporary) {
    /**
     * @type {String|Symbol}
     */
    this.name = name;
    /**
     * @type {String|Object}
     */
    this.type = type !== undefined ? type : name;
    /**
     * @type {Function}
     */
    this.handle = handle;
    /**
     * @type {Function}
     */
    this.isTemporary = isTemporary || Default_isTemporary;
  }

  // Since its VO it should not contain any methods that may change its internal state

  //---------------

  function CommandDescriptor_create(name, handle, command, isTemporary) {
    var descriptor = new CommandDescriptor(name, handle, command, isTemporary);
    // We can use Object.freeze(), it keeps class/constructor information
    return Object.freeze(descriptor);
  }

  CommandDescriptor.create = CommandDescriptor_create;

  return CommandDescriptor;
})();

function descriptorGeneratorFactory(name, command) {
  return function descriptorSetter(handle, isTemporary, target) {
    var descriptor = CommandDescriptor.create(name, handle, command, isTemporary);
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
  var commands = {
    GET: 'get',
    SET: 'set',
    APPLY: 'apply'
  };
  commands.fields = Object.freeze({
    get: GET_FIELD,
    set: SET_FIELD,
    apply: APPLY_FIELD
  });

  function get_list() {
    return [commands.GET, commands.SET, commands.APPLY];
  }

  function createDescriptors(getHandle, setHandle, applyHandle, isTemporary, target) {
    target = target || {};
    commands.createGETDescriptor(getHandle, isTemporary, target);
    commands.createSETDescriptor(setHandle, isTemporary, target);
    commands.createAPPLYDescriptor(applyHandle, isTemporary, target);
    return target;
  }

  Object.defineProperties(commands, {
    list: {
      get: get_list
    }
  });

  commands.createGETDescriptor = descriptorGeneratorFactory(commands.fields.get, commands.GET);
  commands.createSETDescriptor = descriptorGeneratorFactory(commands.fields.set, commands.SET);
  commands.createAPPLYDescriptor = descriptorGeneratorFactory(commands.fields.apply, commands.APPLY);
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
