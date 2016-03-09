/**
 * Created by Oleg Galaburda on 07.03.16.
 */
//FIXME Make an internal class of objects that will hold all of internal functionality & data of the RequestTarget and will never be exposed to public
//FIXME Use Symbol to store internals
// RequestTarget<>-------RequestTargetInternals
// This will help by moving all of RequestTarget internal methods to RequestTargetInternals prototype
// Also try to use Symbols for naming, might help with hiding private members
var RequestTarget = (function() {

  function _createRequestPackage(type, cmd, value, targetId) {
    return pack = {
      type: type,
      cmd: cmd,
      value: value,
      target: targetId
    };
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
        //this._sendRequestHandler(pack, deferred);
        this._sendRequestHandlerPrecondition(pack, deferred);
        break;
    }
    return promise;
  }

  function _sendRequestHandlerPrecondition(pack, deferred) {
    var list = DataConverter.lookupForPending(pack.value);
    if (list.length) {
      // FIXME Need to test on all platforms: In other browsers this might not work because may need list of Promise objects, not RequestTargets
      Promise.all(list).then(function() {
        this._sendRequestHandler(pack, deferred);
      }.bind(this));
    } else {
      this._sendRequestHandler(pack, deferred);
    }
  }

  function _sendRequest(type, cmd, value) {
    var pack = _createRequestPackage(type, cmd, value, this.id);
    var promise = this._applyRequest(pack, createDeferred());
    return new RequestTarget(promise, this._sendRequestHandler);
  }

  function _get(path) {
    return this._sendRequest(CommandType.GET, path);
  }

  function _set(path, value) {
    return this._sendRequest(CommandType.SET, path, value);
  }

  function _call(path, args) {
    if (!args) {
      args = [];
    } else if (!(args instanceof Array)) {
      args = [args];
    }
    return this._sendRequest(CommandType.CALL, path, args);
  }

  function _execute(command) {
    return this._sendRequest(CommandType.EXEC, command);
  }

  function _isActive() {
    return this.status === TargetStatus.PENDING || this.status === TargetStatus.RESOLVED;
  }

  function _canBeDestroyed() {
    return this.id && this.status === TargetStatus.RESOLVED;
  }

  function _toJSON() {
    var json = {
      _targetLink_: {
        id: this.target.id,
        type: this.target.targetType,
        poolId: this.target.poolId
      }
    };
    return json;
  }

  /**
   * The object that will be available on other side
   * IMPORTANT: Function target is temporary if queue contains single CALL command when target is resolved.
   * @param _promise
   * @param sendRequestHandler
   * @constructor
   */
  function RequestTarget(_promise, sendRequestHandler) {
    if (_promise === RequestTarget.NOINIT) return;
    var _this = this;
    var _link = {};
    var _temporary;
    var _hadChildPromises = false;
    var _status = TargetStatus.PENDING;
    var _queue = [];

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
      _sendRequestHandler: {
        value: sendRequestHandler,
        configurable: true
      },
      _targetLink_: {
        value: _this
      }
    });

    function _destroy() {
      var promise = null;
      if (_this.canBeDestroyed()) {
        _status = TargetStatus.DESTROYED;
        promise = _this._sendRequest(CommandType.DESTROY_TARGET);
      } else {
        promise = Promise.reject();
      }
      return promise;
    }

    function _isTemporary(value) {
      /* TODO this case for Proxies, may be check for proxies support? this will work only if Proxies are enabled.
       For functions, they are temporary only if they have only CALL command in queue and child promises never created -- this commonly means that this target was used for function call in proxy.
       For any non-function target object, it will be marked as temporary only if has single item in request queue and child promises never created.
       */
      var temp = _temporary;
      if (typeof(temp) !== 'boolean') {
        if (RequestTargetLink.getLinkTargetType(value) === 'function') {
          temp = _queue && _queue.length === 1 && _queue[0][0].type == CommandType.CALL && !_hadChildPromises;
        } else {
          temp = (_queue && _queue.length === 1 && !_hadChildPromises);
        }
      }
      return temp;
    }

    function _resolveHandler(value) {
      _status = TargetStatus.RESOLVED;
      if (RequestTargetLink.isLink(value)) {
        _link = RequestTargetLink.getLinkData(value);
        _temporary = _isTemporary(value);
        if (_temporary) {
          _queue[_queue.length - 1][1].promise.then(_destroy, _destroy);
        }
        //INFO Sending "this" as result of resolve() handler, causes infinite loop of this.then(), so I've used wrapper object
        value = {target: _this};
      }
      _sendQueue();
      return value;
    }

    function _sendQueue() {
      while (_queue && _queue.length) {
        var request = _queue.shift();
        var pack = request[0];
        var deferred = request[1];
        pack.target = _link.id;
        //_this._sendRequestHandler(pack, deferred);
        _this._sendRequestHandlerPrecondition(pack, deferred);
      }
      _queue = null;
    }

    function _rejectHandler(value) {
      _status = TargetStatus.REJECTED;
      while (_queue && _queue.length) {
        var request = _queue.shift();
        request[1].reject(new Error('Target of the call was rejected and callcannot be sent.'));
      }
      _queue = null;
      return value;
    }

    function _then(success, fail) {
      var child = _promise.then(success, fail);
      //var child = _promise.then.apply(_promise, arguments);
      if (child) {
        _hadChildPromises = true;
      }
      return child;
    }

    function _catch() {
      var child = _promise.catch.apply(_promise, arguments);
      if (child) {
        _hadChildPromises = true;
      }
      return child;
    }

    function _addToQueue(pack, deferred) {
      _queue.push([pack, deferred]);
    }

    _promise = _promise.then(_resolveHandler, _rejectHandler);

    this._addToQueue = _addToQueue;
    this.then = _then;
    this.catch = _catch;
    this.destroy = _destroy;
  }

  RequestTarget.prototype.get = _get;
  RequestTarget.prototype.set = _set;
  RequestTarget.prototype.call = _call;
  RequestTarget.prototype.execute = _execute;
  RequestTarget.prototype.canBeDestroyed = _canBeDestroyed;
  RequestTarget.prototype.isActive = _isActive;
  RequestTarget.prototype.toJSON = _toJSON;
  RequestTarget.prototype._sendRequest = _sendRequest;
  RequestTarget.prototype._applyRequest = _applyRequest;
  RequestTarget.prototype._sendRequestHandlerPrecondition = _sendRequestHandlerPrecondition;

  return RequestTarget;
})();
