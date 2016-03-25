'use strict';
var RequestTargetDecorator = (function() {

  /**
   *
   * @param handlers {RequestHandlers}
   * @constructor
   */
  function RequestTargetDecorator(_factory, _handlers) {
    var _members = new Map();

    function _getMember(propertyName, commandType, isTemporary) {

      function _commandHandler(command, value) {
        var result;
        var promise;
        var error = false;
        if (this[TARGET_INTERNALS]) {
          promise = this[TARGET_INTERNALS].sendRequest(propertyName, commandType, command, value);
          if (promise) {
            promise.then(function(data) {
              RequestTarget.setTemporary(result, Boolean(isTemporary(result, data, command, value)));
            });
          } else {
            promise = Promise.reject(new Error('Initial request failed and didn\'t result in promise.'));
            error = true;
          }
        } else {
          promise = Promise.reject(new Error('Target object is not a resource, so cannot be used for calls.'));
          error = true;
        }
        result = _factory.create(promise);
        if (!error) {
          this[TARGET_INTERNALS].registerChild(result);
        }
        return result;
      }

      if (!_members.has(propertyName)) {
        _members.set(propertyName, _commandHandler);
      }
      return _members.get(propertyName);
    }

    function _apply(request) {
      if (!_handlers.available) return;
      /* FIXME revert change when ES6 will be supported widely
       for (var descriptor of _handlers) {
       request[descriptor.name] = _getMember(descriptor.name, descriptor.type);
       }
       */
      var iterator = _handlers[Symbol.iterator]();
      var result;
      while (!(result = iterator.next()).done) {
        var descriptor = result.value;
        request[descriptor.name] = _getMember(descriptor.name, descriptor.type, descriptor.isTemporary);
      }
      return request;
    }

    this.apply = _apply;
  }

  //------------------- static

  /**
   * @param handlers {RequestHandlers}
   * @returns {RequestTargetDecorator}
   * @constructor
   */
  function RequestTargetDecorator_create(factory, handlers) {
    return new RequestTargetDecorator(factory, handlers);
  }

  RequestTargetDecorator.create = RequestTargetDecorator_create;

  return RequestTargetDecorator;
})();

