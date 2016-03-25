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

  describe('_commandHandler()', function() {
    var promise;
    beforeEach(function() {
      requestPromise = null;
      decorator.apply(resource);
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

    describe('When target is not a resource', function() {
      beforeEach(function() {
        delete resource[TARGET_INTERNALS];
        promise = resource.type('path', 'data');
      });
      it('should result in rejected promise', function(done) {
        promise.catch(function(data) {
          expect(data).to.be.an.instanceof(Error);
          done();
        });
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

  describe('When isTemporary defined', function() {
    var isTemporary, isTemporaryResult;
    var child, childData;
    beforeEach(function() {
      sinon.spy(RequestTarget, 'setTemporary');
      childData = __createRequestTargetData();
      requestPromise = Promise.resolve(childData);
      isTemporary = sinon.spy(function() {
        console.log();
        return isTemporaryResult;
      });
      isTemporaryResult = true;
      handlers.setHandlers({call: new CommandDescriptor('call', function() {
      }, 'call', isTemporary)});
      decorator.apply(resource);
      child = resource.call('command', 'value');
    });

    afterEach(function() {
      // since its static function I should care about removing spy from a method
      RequestTarget.setTemporary.restore();
    });

    it('should not change temporarity to child until resolved', function() {
      expect(isTemporary).to.not.be.called;
    });

    describe('When child resolved', function() {
      beforeEach(function(done) {
        child.then(function() {
          done();
        });
      });

      it('should change temporarity for child', function() {
        expect(isTemporary).to.be.calledOnce;
        expect(isTemporary).to.be.calledWith(child, childData, 'command', 'value');
      });
    });

  });

});
