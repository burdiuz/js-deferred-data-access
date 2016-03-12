/**
 * Global registry per environment
 * @type _TargetPoolRegistry
 */
var TargetPoolRegistry = (function() {

  var _registry = {};

  /**
   *
   * @returns {TargetPool}
   * @private
   */
  function _createPool() {
    var pool = TargetPool.create();
    _register(pool);
    return pool;
  }

  /**
   *
   * @param pool {TargetPool}
   * @private
   */
  function _register(pool) {
    _registry[pool.id] = pool;
    pool.addEventListener(TargetPool.Events.POOL_DESTROY, this._poolDestroyListener);
  }

  /**
   *
   * @param poolId {String}
   * @returns {TargetPool|null}
   * @private
   */
  function _get(poolId) {
    return _registry[poolId] || null;
  }

  /**
   *
   * @param pool {TargetPool|String}
   * @returns {Boolean}
   * @private
   */
  function _isRegistered(pool) {
    return _registry.hasOwnProperty(pool instanceof TargetPool ? pool.id : String(pool));
  }

  /**
   *
   * @param pool {TargetPool|String}
   * @returns {Boolean}
   * @private
   */
  function _remove(pool) {
    var result = false;
    pool = pool instanceof TargetPool ? pool : _get(pool);
    if (pool) {
      pool.removeEventListener(TargetPool.Events.POOL_DESTROY, this._poolDestroyListener);
      result = delete _registry[pool.id];
    }
    return result;
  }

  function __poolDestroyListener(event) {
    _remove(event.data);
  }

  /**
   * @private
   * @constructor
   */
  function _TargetPoolRegistry() {

  }

  _TargetPoolRegistry.prototype.createPool = _createPool;
  _TargetPoolRegistry.prototype.register = _register;
  _TargetPoolRegistry.prototype.get = _get;
  _TargetPoolRegistry.prototype.isRegistered = _isRegistered;
  _TargetPoolRegistry.prototype.remove = _remove;
  /**
   * @private
   */
  _TargetPoolRegistry.prototype._poolDestroyListener = __poolDestroyListener;

  return new _TargetPoolRegistry();
})();
