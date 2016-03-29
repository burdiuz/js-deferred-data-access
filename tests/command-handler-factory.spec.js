/**
 * Created by Oleg Galaburda on 29.03.16.
 */
describe('CommandHandlerFactory', function() {
  var sandbox, factory, getResult, createResult;
  var factory, resource, resolveRequest, requestData;

  function __createSendCommandRequest() {
    var resource = {};
    resource[TARGET_INTERNALS] = {
      sendRequest: sandbox.spy(function(propertyName, pack, deferred) {
        deferred[resolveRequest ? 'resolve' : 'reject'](requestData);
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
    factory = {
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
    resource = __createSendCommandRequest();
    factory = new CommandHandlerFactory(factory);
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

  /*FIXME these tests are outdated and must be reworked

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
   expect(factory.createCached).to.be.calledOnce;
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

   */
});
