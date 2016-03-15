var CommandType = Object.freeze({
  //INFO Exposed Promise method, cannot be overwritten by command
  THEN: 'then',
  //INFO Exposed Promise method, cannot be overwritten by command
  CATCH: 'catch',
  DESTROY_TARGET: '::destroy.resource'
});

var TargetStatus = Object.freeze({
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DESTROYED: 'destroyed'
});

var RequestTargetCommands = Object.freeze({
  DESTROY: CommandType.DESTROY_TARGET
});

var ProxyCommands = Object.freeze({
  GET: 'get',
  SET: 'set',
  APPLY: 'apply'
});


var TARGET_INTERNALS = Symbol('request.target:internals');
var TARGET_DATA = 'resource::data';

var getId = (function() {
  var _base = 'DA/' + String(Date.now()) + '/';
  var _index = 0;
  return function() {
    return _base + String(++_index) + '/' + String(Date.now());
  };
})();

var createDeferred = (function() {

  /**
   * @constructor
   */
  function Deferred() {
    this._status = TargetStatus.PENDING;
    this.promise = new Promise(function(resolve, reject) {
      this._resolveHandler = resolve;
      this._rejectHandler = reject;
    }.bind(this));
    Object.defineProperties(this, {
      status: {
        get: get_status
      }
    });
  }

  function get_status() {
    return this._status;
  }

  function _resolve() {
    var result = this._resolveHandler.apply(null, arguments);
    // changing status later will keep same it in case of Promise internal error
    this._status = TargetStatus.RESOLVED;
    return result;
  }

  function _reject() {
    var result = this._rejectHandler.apply(null, arguments);
    this._status = TargetStatus.REJECTED;
    return result;
  }

  Deferred.prototype.resolve = _resolve;
  Deferred.prototype.reject = _reject;

  /**
   * @returns {Deferred}
   */
  function createDeferred() {
    return new Deferred();
  }

  return createDeferred;
})();

function areProxiesAvailable() {
  return typeof(Proxy) === 'function';
}

/**
 * Interface for all resource types, these will be treated as resources automatically
 * @constructor
 */
function IConvertible() {

}

function getRAWResource(object, pool) {
  pool = pool || ResourcePoolRegistry.defaultResourcePool;
  var data;
  if (object instanceof TargetResource) {
    data = object.toJSON();
  } else if (object instanceof RequestTarget) {
    data = RequestTarget.toJSON(object);
  } else if (object instanceof IConvertible || typeof(object) === 'function') {
    data = pool.set(object).toJSON();
  } else if (isResource(object)) {
    data = object;
  }
  return data;
}

function getResourceData(object) {
  var data = getRAWResource(object);
  return data ? data[TARGET_DATA] : null;
}

function getResourceId(object) {
  var id;
  if (object instanceof TargetResource || object instanceof RequestTarget) {
    id = object[TARGET_INTERNALS].id;
  } else if (isResource(object)) {
    id = object[TARGET_DATA].id;
  }
  return id;
}

function getResourcePoolId(object) {
  var poolId;
  if (isResource(object)) {
    poolId = object[TARGET_DATA].poolId;
  }
  return poolId;
}

function getResourceType(object) {
  var type;
  if (isResource(object)) {
    type = object[TARGET_DATA].type;
  }
  return type;
}

function isResource(object) {
  return object instanceof TargetResource ||
    object instanceof RequestTarget ||
    (object && typeof(object[TARGET_DATA]) === 'object' && object[TARGET_DATA]);
}

function isResourceConvertible(data) {
  return isResource(data) || typeof(data) === 'function' || data instanceof IConvertible;
}
