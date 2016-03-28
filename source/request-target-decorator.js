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
        var self = this;
        var result;
        var promise;
        if (this[TARGET_INTERNALS]) {
          var pack = RequestTargetInternals.createRequestPackage(commandType, command, value, this[TARGET_INTERNALS].id);
          var deferred = createDeferred();
          result = _factory.create(deferred.promise);
          promise = this[TARGET_INTERNALS].sendRequest(propertyName, pack, deferred, result);
          if (promise) {
            promise.then(function(data) {
              RequestTarget.setTemporary(result, Boolean(isTemporary(self, result, pack, data)));
            });
          } else {
            promise = Promise.reject(new Error('Initial request failed and didn\'t result in promise.'));
          }
        } else {
          promise = Promise.reject(new Error('Target object is not a resource, so cannot be used for calls.'));
        }
        return result || _factory.create(promise);
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

    function _setFactory(factory) {
      if(factory){
        _factory = factory;
      }
    }

    this.apply = _apply;
    this.setFactory = _setFactory;
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

