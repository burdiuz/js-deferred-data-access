/**
 * Created by Oleg Galaburda on 29.03.16.
 */
describe('CommandHandlerFactory', function() {
  var sandbox, resourceFactory, descriptor, getResult, createResult, isTemporaryResult;
  var factory, resource, resolveRequest, requestData;

  function __createSendCommandRequest() {
    var resource = {};
    resource[TARGET_INTERNALS] = {
      sendRequest: sandbox.spy(function(propertyName, pack, deferred) {
        if (resolveRequest) {
          deferred.resolve(requestData);
        } else {
          deferred.reject(requestData);
        }
        return deferred.promise;
      }),
      id: '1111'
    };

    return resource;
  }

  before(function() {
    sandbox = sinon.sandbox.create();
  });

  after(function() {
    sandbox.restore();
  });

  beforeEach(function() {
    resourceFactory = {
      getCached: sandbox.spy(function() {
        return getResult;
      }),
      createCached: sandbox.spy(function() {
        return createResult;
      }),
      create: sandbox.spy(function() {
        return createResult;
      })
    };
    descriptor = {
      name: 'property',
      type: 'commandType',
      handle: sandbox.spy(),
      isTemporary: sandbox.spy(function() {
        return isTemporaryResult;
      }),
      cacheable: false
    };
    requestData = {};
    isTemporaryResult = true;
    resolveRequest = true;
    resource = __createSendCommandRequest();
    factory = new CommandHandlerFactory();
    factory.setFactory(resourceFactory);
  });

  it('should store factory value', function() {
    expect(factory.getFactory()).to.be.equal(resourceFactory);
  });

  describe('When requested new member', function() {
    var result;
    beforeEach(function() {
      result = factory.get({
        name: 'property',
        handler: sandbox.spy(),
        type: 'command'
      });
    });
    it('should return new command handler', function() {
      expect(result).to.be.a('function');
    });

    describe('When requested same member', function() {
      var secondResult;
      beforeEach(function() {
        secondResult = factory.get({
          name: 'property',
          handler: sandbox.spy(),
          type: 'command'
        });
      });
      it('should return same command handler', function() {
        expect(secondResult).to.be.equal(result);
      });
    });
  });

  describe('When using generated method', function() {
    var child;
    describe('When target is not a resource', function() {
      var child;
      beforeEach(function() {
        resource = {};
        resourceFactory.create = sandbox.spy(function(promise) {
          return promise;
        });
        getResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        child = resource.method('command', 'value');
      });

      it('should result in rejected promise', function(done) {
        child.catch(function(data) {
          expect(data).to.be.an.instanceof(Error);
          done();
        });
      });

      it('should create new resource for promise', function() {
        expect(resourceFactory.create).to.be.calledOnce;
      });

      it('should pass promise into resource factory.create', function() {
        expect(resourceFactory.create.getCall(0).args[0]).to.be.an.instanceof(Promise);
      });
    });

    describe('When cacheable child is cached', function() {
      beforeEach(function() {
        descriptor.cacheable = true;
        getResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        child = resource.method('command', 'value');
      });
      it('should request cached resource', function() {
        expect(resourceFactory.getCached).to.be.calledOnce;
        expect(resourceFactory.getCached).to.be.calledWith('property', sinon.match({
          type: 'commandType',
          cmd: 'command',
          value: 'value',
          target: resource[TARGET_INTERNALS].id
        }));
      });
      it('should result in cached resource', function() {
        expect(child).to.be.equal(getResult);
      });
      it('should not send request', function() {
        expect(resource[TARGET_INTERNALS].sendRequest).to.not.be.called;
      });
    });

    function sharedTestCases() {
      it('should send request', function() {
        expect(resource[TARGET_INTERNALS].sendRequest).to.be.calledOnce;
        expect(resource[TARGET_INTERNALS].sendRequest).to.be.calledWith(
          'property',
          sinon.match({
            type: 'commandType',
            cmd: 'command',
            value: 'value',
            target: resource[TARGET_INTERNALS].id
          }),
          sinon.match.instanceOf(Deferred),
          createResult
        );
      });
      it('should return created child resource', function() {
        expect(child).to.be.equal(createResult);
      });
      it('should call isTemporary when fulfilled', function(done) {
        resource[TARGET_INTERNALS].sendRequest.getCall(0).returnValue.then(function() {
          expect(descriptor.isTemporary).to.be.calledOnce;
          expect(descriptor.isTemporary).to.be.calledWith(
            resource,
            child,
            sinon.match({
              type: 'commandType',
              cmd: 'command',
              value: 'value',
              target: resource[TARGET_INTERNALS].id
            }),
            requestData
          );
          done();
        });
      });
      it('should subscribe to request resolution', function(done) {
        resource[TARGET_INTERNALS].sendRequest.getCall(0).returnValue.then(function() {
          expect(child[TARGET_INTERNALS].temporary).to.be.equal(isTemporaryResult);
          done();
        });
      });
    }

    describe('When cacheable child is null', function() {
      beforeEach(function() {
        descriptor.cacheable = true;
        getResult = null;
        createResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        child = resource.method('command', 'value');
      });
      it('should request cached resource', function() {
        expect(resourceFactory.getCached).to.be.calledOnce;
      });
      it('should create new cached resource', function() {
        expect(resourceFactory.createCached).to.be.calledOnce;
        expect(resourceFactory.createCached).to.be.calledWith(
          sinon.match.instanceOf(Promise),
          'property',
          sinon.match({
            type: 'commandType',
            cmd: 'command',
            value: 'value',
            target: resource[TARGET_INTERNALS].id
          })
        );
      });
      sharedTestCases();
    });

    describe('When descriptor is not cacheable', function() {
      beforeEach(function() {
        createResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        child = resource.method('command', 'value');
      });
      it('should request not cached resource', function() {
        expect(resourceFactory.getCached).to.not.be.called;
        expect(resourceFactory.createCached).to.not.be.called;
      });
      it('should create not cached resource', function() {
        expect(resourceFactory.create).to.be.calledOnce;
        expect(resourceFactory.create).to.be.calledWith(sinon.match.instanceOf(Promise));
      });
      sharedTestCases();
    })

    describe('When sending request fails', function() {
      beforeEach(function() {
        createResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        resource[TARGET_INTERNALS].sendRequest = sinon.spy(function() {
          return null;
        });
        resourceFactory.create = sandbox.spy(function(promise) {
          return promise;
        });
        child = resource.method('command', 'value');
      });
      it('should regenerate child resource', function() {
        expect(resourceFactory.create).to.be.calledTwice;
        expect(resourceFactory.create.getCall(1).args[0]).to.be.an.instanceof(Promise);
      });
      it('should result into rejected promise', function(done) {
        child.catch(function(data) {
          expect(data).to.be.an.instanceof(Error);
          done();
        });
      });
    });
  });

});
