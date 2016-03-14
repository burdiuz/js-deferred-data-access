/**
 * Global registry per environment
 */
var ResourcePoolRegistry = (function() {

  var _registry = {};

  /**
   *
   * @returns {ResourcePool}
   * @private
   */
  function _createPool() {
    var pool = ResourcePool.create(this);
    _register(pool);
    return pool;
  }

  /**
   *
   * @param pool {ResourcePool}
   * @private
   */
  function _register(pool) {
    _registry[pool.id] = pool;
    pool.addEventListener(ResourcePool.Events.POOL_DESTROY, this._poolDestroyListener);
  }

  /**
   *
   * @param poolId {String}
   * @returns {ResourcePool|null}
   * @private
   */
  function _get(poolId) {
    return _registry[poolId] || null;
  }

  /**
   *
   * @param pool {ResourcePool|String}
   * @returns {Boolean}
   * @private
   */
  function _isRegistered(pool) {
    return _registry.hasOwnProperty(pool instanceof ResourcePool ? pool.id : String(pool));
  }

  /**
   *
   * @param pool {ResourcePool|String}
   * @returns {Boolean}
   * @private
   */
  function _remove(pool) {
    var result = false;
    pool = pool instanceof ResourcePool ? pool : _get(pool);
    if (pool) {
      pool.removeEventListener(ResourcePool.Events.POOL_DESTROY, this._poolDestroyListener);
      result = delete _registry[pool.id];
    }
    return result;
  }

  function __poolDestroyListener(event) {
    _remove(event.data);
  }

  /**
   * @constructor
   */
  function ResourcePoolRegistry() {

  }

  ResourcePoolRegistry.prototype.createPool = _createPool;
  ResourcePoolRegistry.prototype.register = _register;
  ResourcePoolRegistry.prototype.get = _get;
  ResourcePoolRegistry.prototype.isRegistered = _isRegistered;
  ResourcePoolRegistry.prototype.remove = _remove;
  /**
   * @private
   */
  ResourcePoolRegistry.prototype._poolDestroyListener = __poolDestroyListener;

  //--------------- static


  function ResourcePoolRegistry_create() {
    return new ResourcePoolRegistry();
  }

  ResourcePoolRegistry.create = ResourcePoolRegistry_create;

  return ResourcePoolRegistry;
})();
