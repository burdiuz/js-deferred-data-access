/**
 * Created by Oleg Galaburda on 07.03.16.
 */
var RequestTarget = (function() {

  /**
   * The object that will be available on other side
   * IMPORTANT: Function target is temporary if queue contains single CALL command when target is resolved.
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

  function RequestTarget_isPending(value) {
    return value instanceof RequestTarget && RequestTarget_getStatus(value) == TargetStatus.PENDING;
  }

  function RequestTarget_getStatus(target) {
    return target[TARGET_INTERNALS].status;
  }

  function RequestTarget_getQueueLength(target) {
    var queue = target[TARGET_INTERNALS].queue;
    return queue ? queue.length : 0;
  }

  function RequestTarget_getQueueCommands(target) {
    var length;
    var result = [];
    var queue = target[TARGET_INTERNALS].queue;
    if (queue) {
      length = queue.length;
      for (var index = 0; index < length; index++) {
        result.push(queue[index][0].type);
      }
    }
    return result;
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
  RequestTarget.getStatus = RequestTarget_getStatus;
  RequestTarget.getQueueLength = RequestTarget_getQueueLength;
  RequestTarget.getQueueCommands = RequestTarget_getQueueCommands;
  RequestTarget.create = RequestTarget_create;

  return RequestTarget;
})();
