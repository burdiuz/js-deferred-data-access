/**
 * Created by Oleg Galaburda on 21.03.16.
 */
describe('RequestTargetInternals', function() {
  /**
   * @type {Deferred}
   */
  var deferred;
  /**
   * @type {RequestTargetInternals}
   */
  var target;
  /**
   * @type {RequestTarget}
   */
  var requestTarget;
  /**
   * @type {RequestHandlers}
   */
  var handlers;
  var isTemporaryResult, handleResult, linkData, hasHandler;

  beforeEach(function() {
    requestTarget = {};
    hasHandler = true;
    handlers = {
      handle: sinon.spy(function(a, b, c, deferred) {
        deferred.resolve(handleResult);
      }),
      hasHandler: sinon.spy(function() {
        return hasHandler;
      }),
      isTemporary: sinon.spy(function() {
        return isTemporaryResult;
      })
    };
    deferred = createDeferred();
    target = new RequestTargetInternals(requestTarget, deferred.promise, handlers);
  });

  describe('When created, pending', function() {

    it('should store construction arguments', function() {
      expect(target.requestTarget).to.be.equal(requestTarget);
      expect(target.requestHandlers).to.be.equal(handlers);
    });

    it('should initialize internals', function() {
      expect(target.queue).to.be.an.instanceof(Array);
      expect(target.hadChildPromises).to.be.false;
      expect(target.status).to.be.equal(TargetStatus.PENDING);
      expect(target.link).to.be.an('object');
    });

    it('should have NULL data', function(){
      expect(target.id).to.be.null;
      expect(target.type).to.be.null;
      expect(target.poolId).to.be.null;
    });

    it('should create child promise from passed', function() {
      expect(target.promise).to.be.an.instanceof(Promise);
      expect(target.promise).to.not.be.equal(deferred.promise);
    });

    it('should be active', function() {
      expect(target.isActive()).to.be.true;
    });

    it('should not be destroyable', function() {
      expect(target.canBeDestroyed()).to.be.false;
    });

    it('should reject destruction with error', function(done) {
      target.destroy().catch(function(result) {
        assert(result instanceof Error, 'result should be Error');
        done();
      });
    });

    describe('When making child request', function() { // add to queue
      var result;

      beforeEach(function() {
        handleResult = 'hi :)';
        result = target.sendRequest('command', 'do-something', 'with-this', 'thanks');
      });

      it('should have recorded request in queue', function() {
        expect(target.queue).to.have.length(1);
      });

      it('should not send request immediately', function() {
        expect(handlers.handle).to.not.be.called;
      });

      it('result of call should be a Promise', function() {
        expect(result).to.be.an.instanceof(Promise);
      });

      describe('When destroyed', function() {
        var promise;
        beforeEach(function() {
          promise = target.destroy();
        });

        it('should reject destruction with error', function(done) { // they are all pending since parent is not resolved
          promise.catch(function(data) {
            expect(data).to.be.an.instanceof(Error);
            done();
          });
        });
      });

    });

    describe('When subscribing to promise', function() { // mark child promises created
      beforeEach(function() {
        target.then(function() {
        });
      });
      it('should record that promise chain continues', function() {
        expect(target.hadChildPromises).to.be.true;
      });
    });

  });

  describe('When fulfilled', function() {
    beforeEach(function(done) {
      linkData = __createRequestTargetData();
      deferred.resolve(linkData);
      deferred.promise.then(function() {
        done();
      });

    });

    it('should have proper data', function(){
      expect(target.id).to.be.equal(linkData[TARGET_DATA].id);
      expect(target.type).to.be.equal(linkData[TARGET_DATA].type);
      expect(target.poolId).to.be.equal(linkData[TARGET_DATA].poolId);
    });

    it('should change state to resolved', function() {
      expect(target.status).to.be.equal(TargetStatus.RESOLVED);
    });

    it('should destroy queue list', function() {
      expect(target.queue).to.be.null;
    });

    it('should be active', function() {
      expect(target.isActive()).to.be.true;
    });

    it('should be destroyable after resolution', function() {
      expect(target.canBeDestroyed()).to.be.true;
    });

    describe('When subscribing to the promise', function() {
      var subscriber;
      beforeEach(function(done) {
        subscriber = sinon.spy(function() {
          done();
        });
        target.then(subscriber);
      });

      it('should resolve promises', function() {
        expect(subscriber).to.be.calledOnce;
      });

      it('should count subscriber', function() {
        expect(target.hadChildPromises).to.be.true;
      });

      // this is ambiguous, but I'll add this explicitly, so promise never should be resolved with promise-alike object,
      // because in this case original promise will not be resolved, instead it will try to subscribe to resolution
      // and wait for it.
      it('should resolve with <not a promise> object', function() {
        var result = subscriber.getCall(0).args[0];
        expect(result).to.not.have.property('then');
        expect(result).to.not.have.property('catch');
      });

      it('should resolve with wrapper argument', function() {
        var result = subscriber.getCall(0).args[0];
        expect(result.target).to.be.equal(requestTarget);
      });
    });

    describe('When making child request', function() { // handle immediately
      var result;
      beforeEach(function() {
        handleResult = 'nope';
        result = target.sendRequest('name', 'type', 'command', 'way-lue');
      });

      it('should not use queue', function() {
        expect(target.queue).to.be.null;
      });

      it('should handle request immediately', function() {
        expect(handlers.handle).to.be.calledOnce;
        var args = handlers.handle.getCall(0).args;
        expect(args[0]).to.be.equal(requestTarget);
        expect(args[1]).to.be.equal('name');
        expect(args[2]).to.be.eql({
          type: 'type',
          cmd: 'command',
          value: 'way-lue',
          target: target.id
        });
        expect(args[3]).to.be.an.instanceof(Deferred);
      });
    });

    describe('When destroying', function() {
      beforeEach(function() {
        sinon.stub(target, 'sendRequest');
        target.destroy();
      });

      it('should send "destroy" request', function() {
        expect(target.sendRequest).to.be.calledOnce;
        expect(target.sendRequest).to.be.calledWith(RequestTargetCommands.DESTROY, RequestTargetCommands.DESTROY);
      });
    });

  });

  describe('When fulfilled as temporary', function() {
    beforeEach(function(done) {
      linkData = __createRequestTargetData();
      deferred.resolve(linkData);
      target.temporary = true;
      sinon.spy(target, 'sendRequest');
      deferred.promise.then(function() {
        done();
      });
    });

    it('should have "destroyed" status', function() {
      expect(target.status).to.be.equal(TargetStatus.DESTROYED);
    });

    it('should send "destroy" request', function() {
      expect(target.sendRequest).to.be.calledOnce;
      expect(target.sendRequest).to.be.calledWith(RequestTargetCommands.DESTROY, RequestTargetCommands.DESTROY);
    });
  });

  describe('When fulfilled with pending queue', function() {
    beforeEach(function(done) {
      target.sendRequest('name', 'type', 'command', 'way-lue');
      target.sendRequest('no-name', 'no-type', 'no-command', 'no-way-lue');
      linkData = __createRequestTargetData();
      deferred.resolve(linkData);
      deferred.promise.then(function() {
        done();
      });
    });

    it('should change state to resolved', function() {
      expect(target.status).to.be.equal(TargetStatus.RESOLVED);
    });

    it('should send queued requests', function() {
      expect(handlers.handle).to.be.calledTwice;
      expect(handlers.handle).to.be.calledWith(requestTarget, 'name');
      expect(handlers.handle).to.be.calledWith(requestTarget, 'no-name');
    });

    it('should destroy queue list', function() {
      expect(target.queue).to.be.null;
    });
  });

  describe('When fulfilled with not-a-Resource value', function() {
    var promise;
    beforeEach(function() {
      promise = target.sendRequest('1', 'one');
      deferred.resolve(1983);
      deferred.promise.then(function() {
        done();
      });
    });

    it('should reject queued requests', function(done) {
      promise.catch(function(data) {
        expect(data).to.be.an.instanceof(Error);
        done();
      });
    });

  });

  describe('When rejected', function() {
    var child;
    beforeEach(function(done) {

      child = target.sendRequest('1', 'one');

      linkData = {
        message: 'you screwed!'
      };
      deferred.reject(linkData);
      deferred.promise.catch(function() {
        done();
      });
    });

    it('should set status to rejected', function() {
      expect(target.status).to.be.equal(TargetStatus.REJECTED);
    });

    it('should not be active', function() {
      expect(target.isActive()).to.be.false;
    });

    it('should be destroyable after resolution', function() {
      expect(target.canBeDestroyed()).to.be.true;
    });

    it('should reject queue', function(done) {
      child.catch(function(data) {
        expect(data).to.be.an.instanceof(Error);
        done();
      });
    });

    describe('When making child request', function() { // reject immediately
      var result;
      beforeEach(function() {
        result = target.sendRequest('any-name', 'any-type', 'any-command', 'any-way-lue');
      });

      it('promise should be rejected', function(done) {
        result.catch(function(data) {
          assert(data instanceof Error, 'promise result must be an error instance');
          done();
        });
      });
      it('should handle request internally', function() {
        expect(handlers.handle).to.not.be.called;
      });
    });

    describe('When subscribing to the promise', function() {
      var subscriber;
      beforeEach(function(done) {
        subscriber = sinon.spy(function() {
          done();
        });
        target.catch(subscriber);
      });

      it('should count subscriber', function() {
        expect(target.hadChildPromises).to.be.true;
      });

      it('should resolve promises', function() {
        expect(subscriber).to.be.calledOnce;
      });

      it('should resolve with original value', function() {
        var result = subscriber.getCall(0).args[0];
        expect(result).to.be.equal(linkData);
      });
    });

    describe('When destroying', function() {
      var result;
      beforeEach(function() {
        result = target.destroy();
      });

      it('should resolve destruction', function(done) {
        result.then(function(result) {
          assert(!result, 'result should be empty');
          done();
        });
      });
    });

  });

  describe('When destroyed', function() {
    beforeEach(function(done) {
      linkData = __createRequestTargetData();
      deferred.resolve(linkData);
      deferred.promise.then(function() {
        target.destroy();
        done();
      });
    });

    it('should not be active', function() {
      expect(target.isActive()).to.be.false;
    });

    describe('When making child request', function() { // reject immediately
      var result;
      beforeEach(function() {
        handlers.handle.reset();
        result = target.sendRequest('any-name', 'any-type', 'any-command', 'any-way-lue');
      });

      it('promise should be rejected', function(done) {
        result.catch(function(data) {
          assert(data instanceof Error, 'promise result must be an error instance');
          done();
        });
      });

      it('should handle request internally', function() {
        expect(handlers.handle).to.not.be.called;
      });
    });
  });

  describe('When registering children', function() {
    var child;
    describe('When registered child is fulfilled', function() {
      beforeEach(function(done) {
        linkData = __createRequestTargetData();
        deferred.resolve(linkData);
        deferred.promise.then(function() {
          child = __createRequestTarget();
          target.registerChild(child);
          done();
        });
      });

      it('should add pending child to the list', function() {
        expect(target.children).to.have.length(1);
        expect(target.children).to.contain(child);
      });

      it('should remove child from the list when its resolved', function(done) {
        child.then(function() {
          expect(target.children).to.not.contain(child);
          done();
        });
      });
    });

    describe('When registered child is rejected', function() {
      beforeEach(function(done) {
        linkData = __createRequestTargetData();
        deferred.resolve(linkData);
        deferred.promise.then(function() {
          var promise = Promise.reject('bad child');
          child = __createRequestTarget(promise);
          target.registerChild(child);
          done();
        });
      });

      it('should add pending child to the list', function() {
        expect(target.children).to.have.length(1);
        expect(target.children).to.contain(child);
      });

      it('should remove child from the list when its rejected', function(done) {
        child.catch(function() {
          expect(target.children).to.not.contain(child);
          done();
        });
      });
    });
  });

  describe('When sending request', function() {
    describe('When target was fulfilled', function() {
      beforeEach(function(done) {
        linkData = __createRequestTargetData();
        deferred.resolve(linkData);
        deferred.promise.then(function() {
          hasHandler = false;
          done();
        });
      });

      it('should immediately throw error on not existent handler', function() {
        expect(function() {
          target.sendRequest('any', 'thing');
        }).to.throw(Error);
      });

    });
  });

});
