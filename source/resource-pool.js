/**
 * @constructor
 * @extends EventDispatcher
 */
var ResourcePool = (function() {

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
  var REGISTRY_FIELD = Symbol('ResourcePool::registry');
  var validTargets = {};

  /**
   * @ignore
   */
  function ResourcePool(registry) {
    this[REGISTRY_FIELD] = registry;
    this[MAP_FIELD] = new Map();

    Object.defineProperties(this, {
      id: {
        value: getId()
      },
      registry: {
        get: get_registry
      }
    });

    EventDispatcher.apply(this);
  }

  //------------ instance

  function get_registry() {
    return this[REGISTRY_FIELD];
  }

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
      if (this.hasEventListener(ResourcePoolEvents.RESOURCE_REMOVED)) {
        this.dispatchEvent(ResourcePoolEvents.RESOURCE_REMOVED, link);
      }
      link.destroy();
    }
  }

  function _clear() {
    if (this.hasEventListener(ResourcePoolEvents.POOL_CLEAR)) {
      this.dispatchEvent(ResourcePoolEvents.POOL_CLEAR, this);
    }
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

  function _isActive() {
    return Boolean(this[MAP_FIELD]);
  }

  function _destroy() {
    this.clear();
    // intentionally make it not usable after its destroyed
    if (this[REGISTRY_FIELD]) {
      this[REGISTRY_FIELD].remove(this);
    }
    delete this[MAP_FIELD];
    delete this[REGISTRY_FIELD];
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

  function ResourcePool_isValidTarget(target) {
    return Boolean(target && validTargets[typeof(target)]);
  }

  /**
   *
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
   *
   * @returns {string[]} Default types acceptable by ResourcePool
   * @returns Array
   */
  function ResourcePool_getDefaultValidTargets() {
    return ['object', 'function'];
  }

  function ResourcePool_create() {
    return new ResourcePool();
  }

  ResourcePool.isValidTarget = ResourcePool_isValidTarget;
  ResourcePool.setValidTargets = ResourcePool_setValidTargets;
  ResourcePool.getDefaultValidTargets = ResourcePool_getDefaultValidTargets;
  ResourcePool.create = ResourcePool_create;
  ResourcePool.Events = ResourcePoolEvents;

  // setting default valid targets
  ResourcePool.setValidTargets(ResourcePool.getDefaultValidTargets());

  return ResourcePool;
})();
