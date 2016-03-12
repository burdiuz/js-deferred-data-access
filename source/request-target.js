/**
 * Created by Oleg Galaburda on 07.03.16.
 */
var RequestTarget = (function() {
  var NOINIT = {};

  /**
   * The object that will be available on other side
   * IMPORTANT: Function target is temporary if queue contains single CALL command when target is resolved.
   * @param _promise
   * @param requestHandlers
   * @constructor
   */
  function RequestTarget(_promise, _requestHandlers) {
    if (_promise === NOINIT) return;

    Object.defineProperty(this, TARGET_INTERNALS, {
      value: new RequestTargetInternals(_promise, _requestHandlers)
    });

    Object.defineProperties(this, {
      id: {
        get: function() {
          return _link.id;
        },
        configurable: true
      },
      target: {
        get: function() {
          return this;
        }
      },
      targetType: {
        get: function() {
          return _link.type;
        },
        configurable: true
      },
      poolId: {
        get: function() {
          return _link.poolId;
        },
        configurable: true
      },
      temporary: {
        get: function() {
          return _temporary;
        },
        //INFO User can set permanent/temporary by hand
        set: function(value) {
          if (this.isActive()) {
            _temporary = Boolean(value);
            if (_status == TargetStatus.RESOLVED) {
              _destroy();
            }
          }
        }
      },
      status: {
        get: function() {
          return _status;
        },
        configurable: true
      }
    });
  }

  function _then() {
    this[TARGET_INTERNALS].then.apply(this[TARGET_INTERNALS], arguments);
  }

  function _catch() {
    this[TARGET_INTERNALS].catch.apply(this[TARGET_INTERNALS], arguments);
  }

  RequestTarget.prototype.then = _then;
  RequestTarget.prototype.catch = _catch;

  //------------- static
  function RequestTarget_isActive(target) {
    return target[TARGET_INTERNALS].isActive();
  }

  function RequestTarget_canBeDestroyed(target) {
    return target[TARGET_INTERNALS].canBeDestroyed();
  }

  function RequestTarget_destroy(target) {
    return target[TARGET_INTERNALS].destroy();
  }

  function RequestTarget_toJSON(target) {
    return target[TARGET_INTERNALS].toJSON();
  }

  function RequestTarget_lookupForPending(data) {
    var result = [];
    if (typeof(data) === 'object' && data !== null) {
      function add(value) {
        if (RequestTarget_isPending(value)) {
          result.push(value);
        }
        return value;
      }

      if (RequestTarget_isPending(data)) {
        result.push(data);
      } else if (data instanceof Array) {
        convertArrayTo(data, add);
      } else if (data.constructor === Object) {
        convertHashTo(data, add);
      }
    }
    return result;
  }

  function RequestTarget_isPending(value) {
    return value instanceof RequestTarget && RequestTarget_getStatus(value) == TargetStatus.PENDING;
  }

  function RequestTarget_getStatus(target) {
    return target[TARGET_INTERNALS].status;
  }

  function RequestTarget_create(promise, requestHandler) {
    return new RequestTarget(promise, requestHandler);
  }

  RequestTarget.isActive = RequestTarget_isActive;
  RequestTarget.canBeDestroyed = RequestTarget_canBeDestroyed;
  RequestTarget.destroy = RequestTarget_destroy;
  RequestTarget.toJSON = RequestTarget_toJSON;
  RequestTarget.lookupForPending = RequestTarget_lookupForPending;
  RequestTarget.isPending = RequestTarget_isPending;
  RequestTarget.getStatus = RequestTarget_getStatus;
  RequestTarget.create = RequestTarget_create;

  return RequestTarget;
})();
