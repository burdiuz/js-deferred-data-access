/**
 * Created by Oleg Galaburda on 09.03.16.
 */
var RequestTargetFactory = (function() {
  var COMMANDS_FIELD = Symbol('RequestTargetFactory::commands');

  function RequestTargetFactory() {
    Object.defineProperty(this, COMMANDS_FIELD, {value: {}});
  }

  function _getCommandHandler(name) {
    var handler = this[COMMANDS_FIELD][name];
    if (!this[COMMANDS_FIELD].hasOwnProperty(name)) {
      handler = function(command, args) {
        this[TARGET_INTERNALS].sendRequest(name, command, args);
      };
      this[COMMANDS_FIELD][name] = handler;
    }
    return handler;
  }

  function _create(promise, requestHandlers) {
  }

  function _populateWithCommandHandlers(target, requestHandlers) {
    for (var name in requestHandlers) {
      if (requestHandlers.hasOwnProperty(name)) {
        target[name] = _getCommandHandler(name);
      }
    }
  }

  function _template(requestHandlers) {
    var proto = new RequestType(RequestType.NOINIT);
    _populateWithCommandHandlers(proto, requestHandlers);
    function RequestTarget_() {
      RequestTarget.apply(this, arguments);
    }

    RequestTarget_.prototype = proto;
    function templatedFactory(promise) {
      return new RequestTarget_(promise, requestHandlers);
    }

    return templatedFactory;
  }

  RequestTargetFactory.prototype.getCommandHandler = _getCommandHandler;
  RequestTargetFactory.prototype.populateWithCommandHandlers = _populateWithCommandHandlers;
  RequestTargetFactory.prototype.create = _create;
  RequestTargetFactory.prototype.template = _template;
  
  return RequestTargetFactory;
})();
