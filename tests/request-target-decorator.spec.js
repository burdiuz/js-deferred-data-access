describe('RequestTargetDecorator', function() {
  var decorator, resource, factory, handlers;
  var requestPromise;

  function __createSendCommandRequest() {
    var resource = {};
    resource[TARGET_INTERNALS] = {
      sendRequest: sinon.spy(function() {
        return requestPromise;
      }),
      registerChild: sinon.spy()
    };

    return resource;
  }

  beforeEach(function() {
    factory = {
      create: sinon.spy(function(promise) {
        return promise;
      })
    }
    handlers = RequestHandlers.create();
    handlers.setHandlers({
      action: sinon.spy(),
      type: sinon.spy()
    });

    resource = __createSendCommandRequest();
    decorator = RequestTargetDecorator.create(factory, handlers);
  });

  describe('When decorating request', function() {
    beforeEach(function() {
      decorator.decorate(resource);
    });

    it('should add type members to target', function() {
      expect(resource.action).to.be.an('function');
      expect(resource.type).to.be.an('function');
    });

    describe('When decorating other request', function() {
      var newRequest;
      beforeEach(function() {
        newRequest = __createSendCommandRequest();
        decorator.decorate(newRequest);
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
        decorator.decorate(resource);
      });
      it('members should be latest handlers', function() {
        expect(resource.updated).to.be.an('function');
        expect(resource.type).to.be.undefined;
      });
    });

  });

  describe('_commandHandler()', function() {
    var promise;
    beforeEach(function() {
      requestPromise = null;
      decorator.decorate(resource);
      promise = resource.type('path', 'data');
    });

    it('should send request', function() {
      var call;
      expect(resource[TARGET_INTERNALS].sendRequest).to.be.calledOnce;
      call = resource[TARGET_INTERNALS].sendRequest.getCall(0);
      expect(call.args).to.be.eql([
        'type', 'type', 'path', 'data'
      ]);
    });

    it('should create new request', function() {
      expect(factory.create).to.be.calledOnce;
    });

    it('should return rejected promise', function(done) {
      promise.catch(function() {
        done();
      });
    });

    describe('When request returns promise', function() {
      beforeEach(function() {
        requestPromise = Promise.resolve('all ok');
        factory.create.reset();
        promise = resource.type('path', 'data');
      });
      it('should return promise from request', function(done) {
        promise.then(function() {
          done();
        });
      });
      it('should register child request object in parent', function() {
        expect(resource[TARGET_INTERNALS].registerChild).to.be.calledOnce;
        expect(resource[TARGET_INTERNALS].registerChild).to.be.calledWith(promise);
      });

      it('should create new request', function() {
        expect(factory.create).to.be.calledOnce;
      });
    });

  });

});
