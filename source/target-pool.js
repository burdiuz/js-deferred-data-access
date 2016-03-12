var TargetPool = (function() {

  /**
   * Map private field symbol
   */
  var MAP_FIELD = Symbol('TargetPool::map');
  var validTargets = {};

  function TargetPool() {
    this[MAP_FIELD] = new Map();

    Object.defineProperties(this, {
      id: {
        value: getId()
      }
    });

    TargetPoolRegistry.register(this);
  }

  //------------ instance

  function _set(target) {
    var link = null;
    if (TargetPool.isValidTarget(target)) {
      if (this[MAP_FIELD].has(target)) {
        link = this[MAP_FIELD].get(target);
      } else {
        link = TargetResource.create(this, target);
        this[MAP_FIELD].set(link.id, link);
        this[MAP_FIELD].set(target, link);
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
      link.destroy();
    }
  }

  function _clear() {
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
  }

  function _destroy() {
    this.clear();
    // intentionally make it not usable after its destroyed
    this[MAP_FIELD] = null;
    TargetPoolRegistry.remove(this);
  }

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
  TargetPool.exists = isRegistered;
  TargetPool.create = TargetPool_create;

  // setting default valid targets
  TargetPool.setValidTargets(TargetPool.getDefaultValidTargets());

  return TargetPool;
})();
