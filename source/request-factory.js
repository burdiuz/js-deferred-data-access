/**
 * Created by Oleg Galaburda on 13.03.16.
 */
var RequestFactory = (function() {

  var DECORATOR_FIELD = Symbol('request.factory::decorator');
  var HANDLERS_FIELD = Symbol('request.factory::handlers');

  function RequestFactory(handlers) {
    this[HANDLERS_FIELD] = handlers;
    this[DECORATOR_FIELD] = new RequestTargetDecorator(this, handlers);
  }

  function _create(promise) {
    var request = RequestTarget.create(promise, this[HANDLERS_FIELD]);
    this[DECORATOR_FIELD].decorate(request);
    return request;
  }

  RequestFactory.prototype.create = _create;

  //------------------- static

  function RequestFactory_create(handlers) {
    return new RequestFactory(handlers);
  }

  RequestFactory.create = RequestFactory_create;

  return RequestFactory;
})();
