var CommandType = {
  GET: 'get',
  SET: 'set',
  CALL: 'call',
  EXEC: 'exec',
  DESTROY_TARGET: 'destroyTarget'
};

var ResponseTypes = {
  RESULT_SUCCESS: 'success',
  RESULT_FAILURE: 'failure'
};

var TargetStatus = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DESTROYED: 'destroyed'
};


var TARGET_INTERNALS = Symbol('request.target:internals');
var TARGET_DATA = '_targetLink_';

var getId = (function() {
  var _base = 'DA/' + String(Date.now()) + '/';
  var _index = 0;
  return function() {
    return _base + String(++_index) + '/' + String(Date.now());
  };
})();

var createDeferred = (function() {
  function Deferred() {
    this.promise = new Promise(function(resolve, reject) {
      this.resolve = resolve;
      this.reject = reject;
    }.bind(this));
  }

  function createDeferred() {
    return new Deferred();
  }

  return createDeferred;
})();

function getPoolResource(id) {
  var data = {};
  data[TARGET_DATA] = {
    id: id || 0,
    poolId: DataAccessInterface.instance.pool.id
  };
  return data;
};

function getRAWResource(object) {
  var data;
  if (object instanceof TargetResource) {
    data = object.toJSON();
  } else if (object instanceof RequestTarget) {
    data = object[TARGET_INTERNALS].toJSON();
  } else if (isResource(object)) {
    data = object;
  }
  return data;
}

function getResourceData(object) {
  var data = getRAWResource(object);
  return data ? data[TARGET_DATA] : null;
}

function getLinkId(object) {
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
};

function getResourceType(object) {
  var type;
  if (isResource(object)) {
    type = object[TARGET_DATA].type;
  }
  return type;
};

function isResource(object) {
  return object instanceof TargetResource ||
    object instanceof RequestTarget ||
    (object && typeof(object[TARGET_DATA]) === 'object' && object[TARGET_DATA]);
};
