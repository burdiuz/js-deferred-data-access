'use strict';
var RequestTargetDecorator = (function() {

  /**
   *
   * @param handlers {RequestHandlers}
   * @constructor
   */
  function RequestTargetDecorator(_factory, _handlers) {
    var _members = {};

    function _getMember(propertyName, commandType) {

      function _commandHandler(command, value) {
        var promise = this[TARGET_INTERNALS].sendRequest(propertyName, commandType, command, value);
        return _factory.create(promise || Promise.reject('Initial request failed and didn\'t result in promise.'));
      }

      if (!_members.hasOwnProperty(propertyName)) {
        _members[propertyName] = _commandHandler;
      }
      return _members[propertyName];
    }

    function _decorate(request) {
      if (!_handlers.available) return;
      /* FIXME revert change when ES6 willbe supported widely
       for (var descriptor of _handlers) {
       request[descriptor.name] = _getMember(descriptor.name, descriptor.type);
       }
       */
      var iterator = _handlers[Symbol.iterator]();
      var result;
      while (!(result = iterator.next()).done) {
        var descriptor = result.value;
        request[descriptor.name] = _getMember(descriptor.name, descriptor.type);
      }
      return request;
    }

    this.decorate = _decorate;
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

