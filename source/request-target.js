'use strict';
var RequestTarget = (function() {

  /**
   * The object that will be available on other side
   * @param _promise {Promise}
   * @param _requestHandlers {RequestHandlers}
   * @constructor
   */
  function RequestTarget(_promise, _requestHandlers) {

    Object.defineProperty(this, TARGET_INTERNALS, {
      value: new RequestTargetInternals(this, _promise, _requestHandlers)
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
    return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].isActive() : false;
  }

  function RequestTarget_canBeDestroyed(target) {
    return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].canBeDestroyed() : false;
  }

  function RequestTarget_destroy(target) {
    //FIXME might be better to return rejected promise
    return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].destroy() : null;
  }

  function RequestTarget_toJSON(target) {
    return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].toJSON() : null;
  }

  function RequestTarget_isPending(value) {
    return RequestTarget_getStatus(value) == TargetStatus.PENDING;
  }

  function RequestTarget_isTemporary(target) {
    return Boolean(target && target[TARGET_INTERNALS] && target[TARGET_INTERNALS].temporary);
  }

  function RequestTarget_setTemporary(target, value) {
    if (target && target[TARGET_INTERNALS]) {
      target[TARGET_INTERNALS].temporary = Boolean(value);
    }
  }

  function RequestTarget_getStatus(target) {
    return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].status : null;
  }

  function RequestTarget_getQueueLength(target) {
    return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].queue.length : 0;
  }

  function RequestTarget_getQueueCommands(target) {
    var length;
    var result = [];
    var queue = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].queue : null;
    if (queue) {
      length = queue.length;
      for (var index = 0; index < length; index++) {
        result.push(queue[index][0].type);
      }
    }
    return result;
  }

  function RequestTarget_hadChildPromises(target) {
    return Boolean(target && target[TARGET_INTERNALS] && target[TARGET_INTERNALS].hadChildPromises);
  }

  function RequestTarget_getRawPromise(target) {
    return target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].promise : null;
  }

  function RequestTarget_getChildren(target) {
    var list = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].children : null;
    return list ? list.slice() : [];
  }

  function RequestTarget_getChildrenCount(target) {
    var list = target && target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].children : null;
    return list ? list.length : 0;
  }

  /**
   *
   * @param promise {Promise}
   * @param requestHandlers {RequestHandlers}
   * @returns {RequestTarget}
   * @constructor
   */
  function RequestTarget_create(promise, requestHandlers) {
    return new RequestTarget(promise, requestHandlers);
  }

  RequestTarget.isActive = RequestTarget_isActive;
  RequestTarget.canBeDestroyed = RequestTarget_canBeDestroyed;
  RequestTarget.destroy = RequestTarget_destroy;
  RequestTarget.toJSON = RequestTarget_toJSON;
  RequestTarget.isPending = RequestTarget_isPending;
  RequestTarget.isTemporary = RequestTarget_isTemporary;
  RequestTarget.setTemporary = RequestTarget_setTemporary;
  RequestTarget.getStatus = RequestTarget_getStatus;
  RequestTarget.getQueueLength = RequestTarget_getQueueLength;
  RequestTarget.getQueueCommands = RequestTarget_getQueueCommands;
  RequestTarget.hadChildPromises = RequestTarget_hadChildPromises;
  RequestTarget.getRawPromise = RequestTarget_getRawPromise;
  RequestTarget.getChildren = RequestTarget_getChildren;
  RequestTarget.getChildrenCount = RequestTarget_getChildrenCount;
  RequestTarget.create = RequestTarget_create;

  return RequestTarget;
})();
