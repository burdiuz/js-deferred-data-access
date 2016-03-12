/**
 * Global registry per environment
 * @-not-for-now-private
 */
var TargetPoolRegistry = (function() {

  var _registry = {};

  function _register(pool) {
    _registry[pool.id] = pool;
  }

  function _isRegistered(pool) {
    return _registry[pool instanceof TargetPool ? pool.id : String(pool)];
  }

  function _remove(pool) {
    delete _registry[pool instanceof TargetPool ? pool.id : String(pool)];
  }

  /**
   * @private
   */
  function _TargetPoolRegistry() {

  }

  _TargetPoolRegistry.prototype.register = _register;
  _TargetPoolRegistry.prototype.isRegistered = _isRegistered;
  _TargetPoolRegistry.prototype.remove = _remove;

  return new _TargetPoolRegistry();
})();
