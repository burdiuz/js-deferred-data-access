'use strict';
var RequestTargetInternals = (function() {

  /**
   *
   * @param _requestTarget {RequestTarget}
   * @param _promise {Promise}
   * @param _requestHandlers {RequestHandlers}
   * @constructor
   */
  function RequestTargetInternals(_requestTarget, _promise, _requestHandlers) {
    this.requestHandlers = _requestHandlers;
    this.requestTarget = _requestTarget;
    this.link = {};
    //INFO this should be not initialized i.e. keep it undefined, this will be checked later
    this.temporary;
    this.hadChildPromises = false;
    this.status = TargetStatus.PENDING;
    this.queue = [];
    this.children = [];
    this.promise = _promise.then(
      this._resolveHandler.bind(this),
      this._rejectHandler.bind(this)
    );

    Object.defineProperties(this, {
      poolId: {
        get: get_poolId
      },
      type: {
        get: get_type
      },
      id: {
        get: get_id
      }
    });
  }

  function get_poolId() {
    return this.link.poolId || null;
  }

  function get_type() {
    return this.link.type || null;
  }

  function get_id() {
    return this.link.id || null;
  }

  function _resolveHandler(value) {
    this.status = TargetStatus.RESOLVED;
    if (isResource(value)) {
      this.link = getResourceData(value);
      //In theory, at time of these lines executing, "temporary" property should be already set via _commandHandler() set from RequestTargetDecorator
      if (this.temporary) {
        this.queue[this.queue.length - 1][1].promise.then(this.destroy.bind(this), this.destroy.bind(this));
      }
      //INFO Sending "this" as result of resolve() handler, causes infinite loop of this.then(), so I've used wrapper object
      value = {target: this};
      this._sendQueue();
    } else { // else { value must be passed as is }
      this._rejectQueue('Target of the call is not a resource and call cannot be sent.');
    }
    return value;
  }

  function _rejectHandler(value) {
    this.status = TargetStatus.REJECTED;
    this._rejectQueue('Target of the call was rejected and call cannot be sent.');
    return value;
  }

  function _sendQueue() {
    while (this.queue && this.queue.length) {
      var request = this.queue.shift();
      var name = request[0];
      var pack = request[1];
      var deferred = request[2];
      pack.target = this.link.id;
      this._handleRequest(name, pack, deferred);
    }
    this.queue = null;
  }

  function _rejectQueue(message) {
    while (this.queue && this.queue.length) {
      var request = this.queue.shift();
      request[1].reject(new Error(message || 'This request was rejected before sending.'));
    }
    this.queue = null;
  }

  function _sendRequest(name, type, cmd, value) {
    var promise = null;
    if (this.requestHandlers.hasHandler(name)) {
      var pack = RequestTargetInternals.createRequestPackage(type, cmd, value, this.id);
      promise = this._applyRequest(name, pack, createDeferred());
    } else {
      throw new Error('Request handler of type "' + type + '" is not registered.');
    }
    return promise;
  }

  function _addToQueue(name, pack, deferred) {
    this.queue.push([name, pack, deferred]);
  }


  function _applyRequest(name, pack, deferred) {
    var promise = deferred.promise;
    switch (this.status) {
      case TargetStatus.PENDING:
        this._addToQueue(name, pack, deferred);
        break;
      case TargetStatus.REJECTED:
        promise = Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
        break;
      case TargetStatus.DESTROYED:
        promise = Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
        break;
      case TargetStatus.RESOLVED:
        this._handleRequest(name, pack, deferred);
        break;
    }
    return promise;
  }

  function _handleRequest(name, pack, deferred) {
    this.requestHandlers.handle(this.requestTarget, name, pack, deferred);
  }

  function _registerChild(childRequestTarget) {
    var handler = _onChildHandled.bind(this, childRequestTarget);
    var promise = RequestTarget.getRawPromise(childRequestTarget);
    this.children.push(childRequestTarget);
    promise.then(handler, handler);
  }

  function _onChildHandled(childRequestTarget) {
    if (this.children) {
      var index = this.children.indexOf(childRequestTarget);
      if (index >= 0) {
        this.children.splice(index, 1);
      }
    }
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
      this.status = TargetStatus.DESTROYED;
      this._rejectQueue('Target resource was destroyed before sending this call.');
      //FIXME add clearing queue, children list and other removal
      promise = this.sendRequest(RequestTargetCommands.DESTROY);
    } else {
      //FIXME Should be here something as rejection value?
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
  RequestTargetInternals.prototype._sendQueue = _sendQueue;
  RequestTargetInternals.prototype._rejectQueue = _rejectQueue;
  RequestTargetInternals.prototype.sendRequest = _sendRequest;
  RequestTargetInternals.prototype._addToQueue = _addToQueue;
  RequestTargetInternals.prototype._applyRequest = _applyRequest;
  RequestTargetInternals.prototype.registerChild = _registerChild;
  RequestTargetInternals.prototype.isActive = _isActive;
  RequestTargetInternals.prototype.canBeDestroyed = _canBeDestroyed;
  RequestTargetInternals.prototype.destroy = _destroy;
  RequestTargetInternals.prototype.then = _then;
  RequestTargetInternals.prototype.catch = _catch;
  RequestTargetInternals.prototype.toJSON = _toJSON;

  //----------- static

  function _createRequestPackage(type, cmd, value, targetId) {
    return {
      type: type,
      cmd: cmd,
      value: value,
      target: targetId
    };
  }

  RequestTargetInternals.createRequestPackage = _createRequestPackage;

  return RequestTargetInternals;
})();
