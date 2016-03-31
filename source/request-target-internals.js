'use strict';
/**
 * @exports RequestTargetInternals
 */

/**
 * @ignore
 */
var RequestTargetInternals = (function() {

  /**
   * @class RequestTargetInternals
   * @param _requestTarget {RequestTarget}
   * @param _promise {Promise}
   * @param _requestHandlers {RequestHandlers}
   * @private
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
    this._deferred = createDeferred();
    this.promise = this._deferred.promise;

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

    _promise.then(
      _resolveHandler.bind(this),
      _rejectHandler.bind(this)
    );
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
      //INFO Sending "this" as result of resolve() handler, causes infinite loop of this.then(), so I've used wrapper object
      //FIXME Check if Proxy wrapper will work with promise result, probably not
      value = {target: this.requestTarget};
      this._sendQueue();
      //In theory, at time of these lines executing, "temporary" property should be already set via _commandHandler() set from RequestTargetDecorator
      if (this.temporary) {
        this.destroy();
      }
    } else { // else { value must be passed as is }
      this._rejectQueue('Target of the call is not a resource and call cannot be sent.');
    }
    this._deferred.resolve(value);
    delete this._deferred;
  }

  function _rejectHandler(value) {
    this.status = TargetStatus.REJECTED;
    this._rejectQueue('Target of the call was rejected and call cannot be sent.');
    this._deferred.reject(value);
    delete this._deferred;
  }

  function _sendQueue() {
    while (this.queue && this.queue.length) {
      var request = this.queue.shift();
      var name = request[0];
      var pack = request[1];
      var deferred = request[2];
      var child = request[3];
      pack.target = this.link.id;
      this._handleRequest(name, pack, deferred, child);
    }
    this.queue = null;
  }

  function _rejectQueue(message) {
    var error = new Error(message || 'This request was rejected before sending.');
    while (this.queue && this.queue.length) {
      /**
       * @type {Array.<string, CommandDataPack, DataAccessInterface.Deferred>}
       */
      //FIXME [string, {type:string, cmd:string, value:*, target:string}, Deferred] -- how to describe this in JSDoc?
      var request = this.queue.shift();
      request[2].reject(error);
    }
    this.queue = null;
  }

  function _sendRequest(name, pack, deferred, child) {
    var promise = null;
    if (this.requestHandlers.hasHandler(name)) {
      promise = this._applyRequest(name, pack, deferred || createDeferred(), child);
    } else {
      throw new Error('Request handler for "' + name + '" is not registered.');
    }
    if (child) {
      this.registerChild(child);
    }
    return promise;
  }

  function _addToQueue(name, pack, deferred, child) {
    this.queue.push([name, pack, deferred, child]);
  }


  function _applyRequest(name, pack, deferred, child) {
    var promise = deferred.promise;
    switch (this.status) {
      case TargetStatus.PENDING:
        this._addToQueue(name, pack, deferred, child);
        break;
      case TargetStatus.REJECTED:
        promise = Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
        break;
      case TargetStatus.DESTROYED:
        promise = Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
        break;
      case TargetStatus.RESOLVED:
        this._handleRequest(name, pack, deferred, child);
        break;
    }
    return promise;
  }

  function _handleRequest(name, pack, deferred, child) {
    this.requestHandlers.handle(this.requestTarget, name, pack, deferred, child);
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
    return this.status === TargetStatus.RESOLVED || this.status === TargetStatus.REJECTED;
  }

  function _destroy() {
    var promise = null;
    if (this.canBeDestroyed()) {
      //INFO I should not clear children list, since they are pending and requests already sent.
      if (this.status === TargetStatus.RESOLVED) {
        promise = this.sendRequest(RequestTargetCommands.fields.DESTROY, RequestTargetInternals.createRequestPackage(
          RequestTargetCommands.DESTROY,
          null,
          null,
          this.id
        ));
      } else {
        promise = Promise.resolve();
      }
      this.status = TargetStatus.DESTROYED;
    } else {
      promise = Promise.reject(new Error('Invalid or already destroyed target.'));
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

  RequestTargetInternals.prototype._sendQueue = _sendQueue;
  RequestTargetInternals.prototype._rejectQueue = _rejectQueue;
  RequestTargetInternals.prototype.sendRequest = _sendRequest;
  RequestTargetInternals.prototype._addToQueue = _addToQueue;
  RequestTargetInternals.prototype._applyRequest = _applyRequest;
  RequestTargetInternals.prototype._handleRequest = _handleRequest;
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
