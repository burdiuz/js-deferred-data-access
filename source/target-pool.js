var TargetPool = (function() {
  var MAP_FIELD = Symbol('TargetPool::map');
  var validTargets = {};

  function TargetPool_isValidTarget(target) {
    return target && valid[typeof(target)];
  };

  function TargetPool_setValidTargets() {
    validTargets = {};
    var length = arguments.length;
    for (var index = 0; index < length; index++) {
      validTargets[arguments[index]] = true;
    }
  }

  function TargetPool_getDefaultValidTargets() {
    return ['object', 'function'];
  }

  function TargetPool() {
    this[MAP_FIELD] = new Map();

    Object.defineProperties(this, {
      id: {
        value: getId()
      }
    });
  }

  function _set(target) {
    var link = null;
    if (TargetPool.isValidTarget(target)) {
      if (this[MAP_FIELD].has(target)) {
        link = this[MAP_FIELD].get(target);
      } else {
        var id = getId();
        link = new RequestTargetLink(this, target, id);
        this[MAP_FIELD].set(id, link);
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
      this[MAP_FIELD].delete(link.target);
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

  TargetPool.prototype.set = _set;
  TargetPool.prototype.has = _has;
  TargetPool.prototype.get = _get;
  TargetPool.prototype.remove = _remove;
  TargetPool.prototype.clear = _clear;

  TargetPool.isValidTarget = TargetPool_isValidTarget;
  TargetPool.setValidTargets = TargetPool_setValidTargets;
  TargetPool.getDefaultValidTargets = TargetPool_getDefaultValidTargets;

  Object.defineProperties(TargetPool, {
    instance: {
      value: new TargetPool()
    }
  });
})();
