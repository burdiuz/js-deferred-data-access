'use strict';

var TargetStatus = Object.freeze({
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DESTROYED: 'destroyed'
});

/**
 * @type {Symbol}
 * @private
 */
var TARGET_INTERNALS = Symbol('request.target:internals');
/**
 *
 * @type {string}
 * @private
 */
var TARGET_DATA = 'resource::data';

/**
 * @private
 */
var getId = (function() {
  var _base = 'DA/' + String(Date.now()) + '/';
  var _index = 0;
  return function() {
    return _base + String(++_index) + '/' + String(Date.now());
  };
})();

/**
 * @constructor
 * @alias DataAccessInterface.Deferred
 */
var Deferred = (function() {
  function Deferred() {
    this._status = TargetStatus.PENDING;
    this.promise = new Promise(function(resolve, reject) {
      this.resolve = resolve;
      this.reject = reject;
    }.bind(this));
  }

  return Deferred;
})();

/**
 * @returns {Deferred}
 * @private
 */
function createDeferred() {
  return new Deferred();
}
/**
 * @returns {boolean}
 * @private
 */
function areProxiesAvailable() {
  return typeof(Proxy) === 'function';
}

/**
 * Interface for all resource types, these will be treated as resources automatically
 * @interface
 * @alias DataAccessInterface.IConvertible
 */
function IConvertible() {

}
/**
 * @method DataAccessInterface.getRAWResource
 * @param object
 * @param pool
 * @returns {*}
 */
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

/**
 * @method DataAccessInterface.getResourceData
 * @param {*} object
 * @returns {null}
 */
function getResourceData(object) {
  var data = getRAWResource(object);
  return data ? data[TARGET_DATA] : null;
}

/**
 * @method DataAccessInterface.getResourceId
 * @param object
 * @returns {*}
 */
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

/**
 * @method DataAccessInterface.getResourcePoolId
 * @param object
 * @returns {*}
 */
function getResourcePoolId(object) {
  var poolId = null;
  if (typeof(object[TARGET_INTERNALS]) === 'object') {
    poolId = object[TARGET_INTERNALS].poolId;
  } else if (isResource(object)) {
    poolId = object[TARGET_DATA].poolId;
  }
  return poolId;
}

/**
 * @method DataAccessInterface.getResourceType
 * @param object
 * @returns {*}
 */
function getResourceType(object) {
  var type = null;
  if (typeof(object[TARGET_INTERNALS]) === 'object') {
    type = object[TARGET_INTERNALS].type;
  } else if (isResource(object)) {
    type = object[TARGET_DATA].type;
  }
  return type;
}

/**
 * @method DataAccessInterface.isResource
 * @param object
 * @returns {boolean|*}
 */
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

/**
 * @method DataAccessInterface.isResourceConvertible
 * @param data
 * @returns {boolean|*|boolean}
 */
function isResourceConvertible(data) {
  return isResource(data) || typeof(data) === 'function' || data instanceof IConvertible;
}
