'use strict';

/**
 * @ignore
 */
var CommandHandlerFactory = (function() {
  /**
   * @constructor
   * @private
   */
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
          var pack = RequestTargetInternals.createRequestPackage(commandType, arguments, this[TARGET_INTERNALS].id);
          var request = getChildRequest(propertyName, pack, cacheable);
          result = request.child;
          if (request.deferred) {
            promise = this[TARGET_INTERNALS].sendRequest(propertyName, pack, request.deferred, result);
            if (promise) {
              if (isTemporary) {
                //FIXME isTemporary must be called before `result` was resolved
                //FIXME remove default `isTemporary`, if not defined just skip
                checkState(promise, isTemporary, this, result, pack);
              }
            }else{
              result = null;
              promise = Promise.reject(new Error('Initial request failed and didn\'t result in promise.'));
            }
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
      }
    }

    function _setFactory(factory) {
      _factory = factory;
    }

    this.get = _get;

    this.setFactory = _setFactory;
  }

  return CommandHandlerFactory;
})();
