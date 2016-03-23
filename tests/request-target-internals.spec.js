/**
 * Created by Oleg Galaburda on 21.03.16.
 */
describe('RequestTargetInternals', function() {
  /**
   * @type {{status:string, promise:Promise}}
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
  var isTemporaryResult, handleResult, linkData;

  beforeEach(function() {
    requestTarget = {};
    handlers = {
      handle: sinon.spy(function(a, b, c, deferred) {
        deferred.resolve(handleResult);
      }),
      hasHandler: sinon.spy(function() {
        return true;
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
    it('should create child promise from passed', function() {
      expect(target.promise).to.be.an.instanceof(Promise);
      expect(target.promise).to.not.be.equal(deferred.promise);
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

  describe('When resolved', function() {
    beforeEach(function(done) {
      linkData = __createRequestTargetData();
      deferred.resolve(linkData);
      deferred.promise.then(function() {
        done();
      });
    });

    it('should change state to resolved', function() {
      expect(target.status).to.be.equal(TargetStatus.RESOLVED);
    });

    it('should destroy queue list', function() {
      expect(target.queue).to.be.null;
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
  });

  describe('When resolved with pending queue', function() {
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

  describe('When rejected', function() {
    beforeEach(function(done) {
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
    it('should be destroyable', function() {
      expect(target.canBeDestroyed()).to.be.true;
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
  });
  describe('When request sent', function() {

  });
});
