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
