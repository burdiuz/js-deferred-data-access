describe('RequestTargetDecorator', function() {
  var decorator, resource, factory, handlers;
  var requestData, resolveRequest;

  function __createSendCommandRequest() {
    var resource = {};
    resource[TARGET_INTERNALS] = {
      sendRequest: sinon.spy(function(propertyName, pack, deferred) {
        deferred[resolveRequest ? 'resolve' : 'reject'](requestData);
        return deferred.promise;
      }),
      registerChild: sinon.spy(),
      id: '1111'
    };

    return resource;
  }

  beforeEach(function() {
    factory = {
      getCached: sinon.spy(function(name, pack) {
        return null;
      }),
      createCached: sinon.spy(function(promise, name, pack) {
        return promise;
      }),
      create: sinon.spy(function(promise) {
        return promise;
      })
    }
    handlers = RequestHandlers.create();
    handlers.setHandlers({
      action: sinon.spy(),
      type: sinon.spy()
    });

    resolveRequest = true;

    resource = __createSendCommandRequest();
    decorator = RequestTargetDecorator.create(factory, handlers);
  });

  describe('When handlers are not available', function() {
    beforeEach(function() {
      handlers.setHandlers({});
    });
    it('should work as expected', function() {
      expect(function() {
        decorator.apply(resource);
      }).to.not.throw(Error);
    });
  });

  describe('When decorating request', function() {
    beforeEach(function() {
      decorator.apply(resource);
    });

    it('should add type members to target', function() {
      expect(resource.action).to.be.an('function');
      expect(resource.type).to.be.an('function');
    });

    describe('When decorating other request', function() {
      var newRequest;
      beforeEach(function() {
        newRequest = __createSendCommandRequest();
        decorator.apply(newRequest);
      });
      it('members should be same handlers', function() {
        expect(newRequest.action).to.be.equal(resource.action);
        expect(newRequest.type).to.be.equal(resource.type);
      });
    });

    describe('When handlers changed', function() {
      beforeEach(function() {
        handlers.setHandlers({
          updated: sinon.spy()
        });

        resource = __createSendCommandRequest();
        decorator.apply(resource);
      });
      it('members should be latest handlers', function() {
        expect(resource.updated).to.be.an('function');
        expect(resource.type).to.be.undefined;
      });
    });

  });

});
