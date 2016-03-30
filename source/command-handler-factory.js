/**
 * Created by Oleg Galaburda on 29.03.16.
 */
'use strict';

var CommandHandlerFactory = (function() {
  function CommandHandlerFactory() {
    var _members = new Map();
    var _factory;

    /**
     * @param {CommandDescriptor} descriptor
     * @returns {Function}
     * @private
     */
    function _get(descriptor) {
      var propertyName = descriptor.name;
      if (!_members.has(propertyName)) {
        _members.set(propertyName, _create(descriptor.name, descriptor.type, descriptor.isTemporary, descriptor.cacheable));
      }
      return _members.get(propertyName);
    }

    function _create(propertyName, commandType, isTemporary, cacheable) {

      function _commandHandler(command, value) {
        var result;
        var promise;
        if (this[TARGET_INTERNALS]) {
          var pack = RequestTargetInternals.createRequestPackage(commandType, command, value, this[TARGET_INTERNALS].id);
          var request = getChildRequest(propertyName, pack, cacheable);
          result = request.child;
          if (request.deferred) {
            promise = this[TARGET_INTERNALS].sendRequest(propertyName, pack, request.deferred, result);
            if (!promise) {
              result = null;
            }
            promise = checkState(promise, isTemporary, this, result, pack);
          }
        } else {
          promise = Promise.reject(new Error('Target object is not a resource, so cannot be used for calls.'));
        }
        return result || _factory.create(promise);
      }

      return _commandHandler;
    }

    function getChildRequest(propertyName, pack, cacheable) {
      var child, deferred;
      if (cacheable) {
        child = _factory.getCached(propertyName, pack);
      }
      if (!child) {
        deferred = createDeferred();
        if (cacheable) {
          child = _factory.createCached(deferred.promise, propertyName, pack);
        } else {
          child = _factory.create(deferred.promise, propertyName, pack);
        }
      }
      return {child: child, deferred: deferred};
    }

    function checkState(promise, isTemporary, parentRequest, childRequest, pack) {
      if (promise) {
        promise.then(function(data) {
          RequestTarget.setTemporary(childRequest, Boolean(isTemporary(parentRequest, childRequest, pack, data)));
        });
      } else {
        promise = Promise.reject(new Error('Initial request failed and didn\'t result in promise.'));
      }
      return promise;
    }

    function _setFactory(factory) {
      _factory = factory;
    }

    this.get = _get;

    this.setFactory = _setFactory;
  }

  return CommandHandlerFactory;
})();
