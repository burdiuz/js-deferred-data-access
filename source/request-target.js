/**
 * Created by Oleg Galaburda on 07.03.16.
 */
//FIXME Make an internal class of objects that will hold all of internal functionality & data of the RequestTarget and will never be exposed to public
//FIXME Use Symbol to store internals
// RequestTarget<>-------RequestTargetInternals
// This will help by moving all of RequestTarget internal methods to RequestTargetInternals prototype
// Also try to use Symbols for naming, might help with hiding private members

var RequestTargetInternals = (function() {

  function RequestTargetInternals(_promise, _requestHandlers) {
    this.requestHandlers = _requestHandlers;
    this.link = {};
    //INFO this should be not initialized i.e. undefined, this will be checked later
    this.temporary;
    this.hadChildPromises = false;
    this.status = TargetStatus.PENDING;
    this.queue = [];
    this.promise = _promise.then(
      this._resolveHandler.bind(this),
      this._rejectHandler.bind(this)
    );
  }

  function _resolveHandler(value) {
    this.status = TargetStatus.RESOLVED;
    if (isResource(value)) {
      this.link = getResourceData(value);
      this.temporary = RequestTargetInternals.isTemporary(this, value);
      if (this.temporary) {
        this.queue[this.queue.length - 1][1].promise.then(this.destroy.bind(this), this.destroy.bind(this));
      }
      //INFO Sending "this" as result of resolve() handler, causes infinite loop of this.then(), so I've used wrapper object
      value = {target: this};
    }
    this._sendQueue();
    return value;
  }

  function _rejectHandler(value) {
    this.status = TargetStatus.REJECTED;
    while (this.queue && this.queue.length) {
      var request = this.queue.shift();
      request[1].reject(new Error('Target of the call was rejected and callcannot be sent.'));
    }
    this.queue = null;
    return value;
  }

  function _sendQueue() {
    while (this.queue && this.queue.length) {
      var request = this.queue.shift();
      var pack = request[0];
      var deferred = request[1];
      pack.target = this.link.id;
      this._callRequestHandler(pack, deferred);
    }
    this.queue = null;
  }

  function sendRequest(type, cmd, value) {
    var request = null;
    if (this.hasRequestHandler(type)) {
      var pack = RequestTargetInternals.createRequestPackage(type, cmd, value, this.id);
      var promise = this._applyRequest(pack, createDeferred());
      request = RequestTarget.factory(promise, this.requestHandlers);
    } else {
      throw new Error('Request handler of type "' + type + '" is not registered.');
    }
    return request;
  }

  function _addToQueue(pack, deferred) {
    this.queue.push([pack, deferred]);
  }


  function _applyRequest(pack, deferred) {
    var promise = deferred.promise;
    switch (this.status) {
      case TargetStatus.PENDING:
        this._addToQueue(pack, deferred);
        break;
      case TargetStatus.REJECTED:
        promise = Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
        break;
      case TargetStatus.DESTROYED:
        promise = Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
        break;
      case TargetStatus.RESOLVED:
        this._callRequestHandler(pack, deferred);
        break;
    }
    return promise;
  }

  function _callRequestHandler(pack, deferred) {
    var list = DataConverter.lookupForPending(pack.value);
    var handler = this.requestHandlers[pack.type];
    if (list.length) {
      // FIXME Need to test on all platforms: In other browsers this might not work because may need list of Promise objects, not RequestTargets
      Promise.all(list).then(function() {
        handler(pack, deferred);
      });
    } else {
      handler(pack, deferred);
    }
  }

  function _hasRequestHandler(type) {
    return this.requestHandlers.hasOwnProperty(type) && typeof(this.requestHandlers[type]) === 'function';
  }


  function _isActive() {
    return this.status === TargetStatus.PENDING || this.status === TargetStatus.RESOLVED;
  }

  function _canBeDestroyed() {
    return this.status === TargetStatus.RESOLVED && this.link.id;
  }

  function _destroy() {
    var promise = null;
    if (this.canBeDestroyed()) {
      _status = TargetStatus.DESTROYED;
      //FIXME Should DESTROY_TARGET be a custom command too? How to handle such custom behavior?
      promise = this.sendRequest(CommandType.DESTROY_TARGET);
    } else {
      promise = Promise.reject();
    }
    return promise;
  }

  function _then() {
    var child = this.promise.then.apply(this.promise, arguments);
    if (child) {
      this.hadChildPromises = true;
    }
    return child;
  }

  function _catch() {
    var child = this.promise.catch.apply(this.promise, arguments);
    if (child) {
      this.hadChildPromises = true;
    }
    return child;
  }

  function _toJSON() {
    var data = {};
    data[TARGET_DATA] = {
      id: this.link.id,
      type: this.link.type,
      poolId: this.link.poolId
    };
    return data;
  }

  RequestTargetInternals.prototype._resolveHandler = _resolveHandler;
  RequestTargetInternals.prototype._rejectHandler = _rejectHandler;
  RequestTargetInternals.prototype.hasRequestHandler = _hasRequestHandler;
  RequestTargetInternals.prototype._sendQueue = _sendQueue;
  RequestTargetInternals.prototype.sendRequest = _sendRequest;
  RequestTargetInternals.prototype._addToQueue = _addToQueue;
  RequestTargetInternals.prototype._applyRequest = _applyRequest;
  RequestTargetInternals.prototype._callRequestHandler = _callRequestHandler;
  RequestTargetInternals.prototype.isActive = _isActive;
  RequestTargetInternals.prototype.canBeDestroyed = _canBeDestroyed;
  RequestTargetInternals.prototype.destroy = _destroy;
  RequestTargetInternals.prototype.then = _then;
  RequestTargetInternals.prototype.catch = _catch;
  RequestTargetInternals.prototype.toJSON = _toJSON;

  //----------- static

  function _isTemporary(target, value) {
    /* TODO this case for Proxies, may be check for proxies support? this will work only if Proxies are enabled.
     For functions, they are temporary only if they have only CALL command in queue and child promises never created -- this commonly means that this target was used for function call in proxy.
     For any non-function target object, it will be marked as temporary only if has single item in request queue and child promises never created.
     */
    var temp = target.temporary;
    if (typeof(temp) !== 'boolean') {
      if (getResourceType(value) === 'function') {
        //FIXME moving to dynamic command types should somehow solve `temporary` detection
        temp = target.queue && target.queue.length === 1 && target.queue[0][0].type == CommandType.CALL && !target.hadChildPromises;
      } else {
        temp = (target.queue && target.queue.length === 1 && !target.hadChildPromises);
      }
    }
    return temp;
  }

  function _createRequestPackage(type, cmd, value, targetId) {
    return {
      type: type,
      cmd: cmd,
      value: value,
      target: targetId
    };
  }

  RequestTargetInternals.isTemporary = _isTemporary;
  RequestTargetInternals.createRequestPackage = _createRequestPackage;

  return RequestTargetInternals;
})();


var RequestTarget = (function() {

  /**
   * The object that will be available on other side
   * IMPORTANT: Function target is temporary if queue contains single CALL command when target is resolved.
   * @param _promise
   * @param requestHandlers
   * @constructor
   */
  function RequestTarget(_promise, _requestHandlers) {
    if (_promise === RequestTarget.NOINIT) return;

    this[TARGET_INTERNALS] = new RequestTargetInternals(_promise, _requestHandlers);

    Object.defineProperties(_this, {
      id: {
        get: function() {
          return _link.id;
        },
        configurable: true
      },
      target: {
        get: function() {
          return _this;
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
      },
      _targetLink_: {
        value: _this
      }
    });
  }

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

  function RequestTarget_factory(promise, requestHandler) {
    return new RequestTarget(promise, requestHandler);
  }

  RequestTarget.isActive = RequestTarget_isActive;
  RequestTarget.canBeDestroyed = RequestTarget_canBeDestroyed;
  RequestTarget.destroy = RequestTarget_destroy;
  RequestTarget.toJSON = RequestTarget_toJSON;
  RequestTarget.factory = RequestTarget_factory;

  return RequestTarget;
})();
