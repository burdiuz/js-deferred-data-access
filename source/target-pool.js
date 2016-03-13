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
