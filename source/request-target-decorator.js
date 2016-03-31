'use strict';
/**
 * @exports RequestTargetDecorator
 */

/**
 * @ignore
 */
var RequestTargetDecorator = (function() {

  /**
   * @class RequestTargetDecorator
   * @param {RequestFactory} _factory
   * @param {RequestHandlers} _handlers
   * @private
   */
  function RequestTargetDecorator(_factory, _handlers) {

    var _members = new CommandHandlerFactory();
    _members.setFactory(_factory);

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
        request[descriptor.name] = _members.get(descriptor);
      }
      return request;
    }

    function _setFactory(factory) {
      if (factory) {
        _members.setFactory(factory);
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

