//TODO User can decorate RequestTarget by their type! define requestHandlers and from them I can build CommandDescriptors
// and decorate RequestTargets depending on target type, for object it will be set of GET/SET/CALL, for function -- APPLY

var RequestTargetDecorator = (function() {

  /**
   *
   * @param handlers {RequestHandlers}
   * @constructor
   */
  function RequestTargetDecorator(_factory, _handlers) {
    var _members = {};

    function _getMember(name) {
      if (!_members.hasOwnProperty(name)) {
        _members[name] = (function(type) {
          function _commandHandler(command, value) {
            var promise = this[TARGET_INTERNALS].sendRequest(type, command, value);
            return _factory.create(promise || Promise.reject('Initial request failed and didn\'t result in promise.'));
          }

          return _commandHandler;
        })(name);
      }
      return _members[name];
    }

    function _decorate(request) {
      var handlers = _handlers.getHandlers();
      for (var name in handlers) {
        request[name] = _getMember(name);
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
  function RequestTargetDecorator_create(handlers) {
    return new RequestTargetDecorator(handlers);
  }

  RequestTargetDecorator.create = RequestTargetDecorator_create;

  return RequestTargetDecorator;
})();

