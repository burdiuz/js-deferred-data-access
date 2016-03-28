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

  describe('_commandHandler()', function() {
    var promise;
    beforeEach(function() {
      requestData = null;
      resolveRequest = false;
      decorator.apply(resource);
      promise = resource.type('path', 'data');
    });

    it('should send request', function() {
      var call;
      expect(resource[TARGET_INTERNALS].sendRequest).to.be.calledOnce;
      call = resource[TARGET_INTERNALS].sendRequest.getCall(0);
      expect(call.args[0]).to.be.equal('type');
      expect(call.args[1]).to.be.eql({type: 'type', cmd: 'path', value: 'data', target: '1111'});
      expect(call.args[2]).to.be.an.instanceof(Deferred);
      expect(call.args[3]).to.be.an.instanceof(Promise); // mocked RequestTarget
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

  });

  describe('When isTemporary defined', function() {
    var isTemporary, isTemporaryResult;
    var child;
    beforeEach(function() {
      sinon.spy(RequestTarget, 'setTemporary');
      requestData = __createRequestTargetData();
      isTemporary = sinon.spy(function() {
        return isTemporaryResult;
      });
      isTemporaryResult = true;
      handlers.setHandlers({
        call: new CommandDescriptor('call', function() {
        }, 'call', isTemporary)
      });
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
        expect(isTemporary).to.be.calledWith(resource, child, {
          type: 'call',
          cmd: 'command',
          value: 'value',
          target: '1111'
        }, requestData);
      });
    });

  });

});
