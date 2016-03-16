/**
 * Created by Oleg Galaburda on 16.03.16.
 */
describe('RequestTargetDecorator', function() {
  var decorator, resource, factory, handlers;

  function __createSendCommandRequest() {
    var resource = {};
    resource[TARGET_INTERNALS] = {
      sendRequest: sinon.spy()
    };

    return resource;
  }

  beforeEach(function() {
    factory = {
      create: sinon.spy(function(promise) {
        return promise;
      })
    }
    handlers = {
      available: true,
      getHandlers: sinon.spy(function() {
        return {
          action: sinon.spy(),
          command: sinon.spy()
        }
      })
    };

    resource = __createSendCommandRequest();
    decorator = RequestTargetDecorator.create(factory, handlers);
  });

  describe('When decorating request', function() {
    beforeEach(function() {
      decorator.decorate(resource);
    });

    it('should add command members to target', function() {
      expect(resource.action).to.be.an('function');
      expect(resource.command).to.be.an('function');
    });

    describe('When decorating other request', function() {
      var newRequest;
      beforeEach(function() {
        newRequest = __createSendCommandRequest();
        decorator.decorate(newRequest);
      });
      it('members should be same handlers', function() {
        expect(newRequest.action).to.be.equal(resource.action);
        expect(newRequest.command).to.be.equal(resource.command);
      });
    });

    describe('When handlers not available', function() {
      beforeEach(function() {
        handlers.available = false;
        resource = __createSendCommandRequest();
        handlers.getHandlers.reset();
        decorator.decorate(resource);
      });
      it('should not apply handlers', function() {
        expect(handlers.getHandlers).to.not.be.called;
        expect(resource.action).to.be.undefined;
      });
    });

    describe('When handlers changed', function() {
      beforeEach(function() {
        handlers.getHandlers = sinon.spy(function() {
          return {
            updated: sinon.spy()
          }
        });

        resource = __createSendCommandRequest();
        decorator.decorate(resource);
      });
      it('members should be latest handlers', function() {
        expect(resource.updated).to.be.an('function');
        expect(resource.command).to.be.undefined;
      });
    });

  });

  describe('_commandHandler()', function() {
    var promise;
    beforeEach(function() {
      decorator.decorate(resource);
      promise = resource.command('path', 'data');
    });

    it('should send request', function() {
      var call;
      expect(resource[TARGET_INTERNALS].sendRequest).to.be.calledOnce;
      call = resource[TARGET_INTERNALS].sendRequest.getCall(0);
      expect(call.args).to.be.eql([
        'command', 'path', 'data'
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
        resource[TARGET_INTERNALS].sendRequest = sinon.spy(function() {
          return Promise.resolve('all ok');
        });
        factory.create.reset();
        promise = resource.command('path', 'data');
      });
      it('should return promise from request', function(done) {
        promise.then(function() {
          done();
        });
      });

      it('should create new request', function() {
        expect(factory.create).to.be.calledOnce;
      });
    });

  });

});
