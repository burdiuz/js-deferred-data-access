'use strict';
var TargetStatus = Object.freeze({
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DESTROYED: 'destroyed'
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

var Deferred = (function() {

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

  return Deferred;
})();

/**
 * @returns {Deferred}
 */
function createDeferred() {
  return new Deferred();
}

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
  var data = null;
  if (object instanceof TargetResource) {
    data = object.toJSON();
  } else if (typeof(object[TARGET_INTERNALS]) === 'object') {
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
  var id = null;
  //if (object instanceof TargetResource || object instanceof RequestTarget) {
  if (typeof(object[TARGET_INTERNALS]) === 'object') {
    id = object[TARGET_INTERNALS].id;
  } else if (isResource(object)) {
    id = object[TARGET_DATA].id;
  }
  return id;
}

function getResourcePoolId(object) {
  var poolId = null;
  if (typeof(object[TARGET_INTERNALS]) === 'object') {
    poolId = object[TARGET_INTERNALS].poolId;
  } else if (isResource(object)) {
    poolId = object[TARGET_DATA].poolId;
  }
  return poolId;
}

function getResourceType(object) {
  var type = null;
  if (typeof(object[TARGET_INTERNALS]) === 'object') {
    type = object[TARGET_INTERNALS].type;
  } else if (isResource(object)) {
    type = object[TARGET_DATA].type;
  }
  return type;
}

function isResource(object) {
  return object instanceof TargetResource ||
    object instanceof RequestTarget ||
    (object && (
      // this case for RequestTargets and TargetResources which contain data in TARGET_INTERNALS Symbol
      // We check for their types above but in cases when Proxies are enabled their type will be Function
      // and verification will come to this case
      typeof(object[TARGET_INTERNALS]) === 'object' ||
      // this case for RAW resources passed via JSON conversion, look like {'resource::data': {id: '1111', poolId: '22222'}}
      typeof(object[TARGET_DATA]) === 'object'
    ));
}

function isResourceConvertible(data) {
  return isResource(data) || typeof(data) === 'function' || data instanceof IConvertible;
}
