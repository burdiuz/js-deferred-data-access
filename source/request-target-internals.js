var RequestTargetInternals = (function() {

  /**
   *
   * @param _requestTarget {RequestTarget}
   * @param _promise {Promise}
   * @param _requestHandlers {RequestHandlers}
   * @constructor
   */
  function RequestTargetInternals(_requestTarget, _promise, _requestHandlers) {
    this._requestHandlers = _requestHandlers;
    this._requestTarget = _requestTarget;
    this.link = {};
    //INFO this should be not initialized i.e. keep it undefined, this will be checked later
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
      this.temporary = this._requestHandlers.isTemporary(this._requestTarget);
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
      request[1].reject(new Error('Target of the call was rejected and call cannot be sent.'));
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
      this._requestHandlers.handle(this._requestTarget, pack, deferred);
    }
    this.queue = null;
  }

  function _sendRequest(type, cmd, value) {
    var promise = null;
    if (this._requestHandlers.hasHandler(type)) {
      var pack = RequestTargetInternals.createRequestPackage(type, cmd, value, this.id);
      promise = this._applyRequest(pack, createDeferred());
    } else {
      throw new Error('Request handler of type "' + type + '" is not registered.');
    }
    return promise;
  }

  function _addToQueue(pack, deferred) {
    this.queue.push([pack, deferred]);
  }


  function _applyRequest(pack, deferred) {
    var promise = deferred.promise;
    var type = pack.type;
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
        this._requestHandlers.handle(this._requestTarget, pack, deferred);
        break;
    }
    return promise;
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
  RequestTargetInternals.prototype._sendQueue = _sendQueue;
  RequestTargetInternals.prototype.sendRequest = _sendRequest;
  RequestTargetInternals.prototype._addToQueue = _addToQueue;
  RequestTargetInternals.prototype._applyRequest = _applyRequest;
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

  RequestTargetInternals.isTemporary = _isTemporary;
  RequestTargetInternals.createRequestPackage = _createRequestPackage;

  return RequestTargetInternals;
})();
