/**
 * Created by Oleg Galaburda on 21.03.16.
 */
describe.only('RequestTargetInternals', function() {
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

    describe('When making child request', function() { // add to queue
      var result;

      beforeEach(function() {
        handleResult = 'hi :)';
        result = target.sendRequest('command', 'do-something', 'with-this', 'thanks');
      });

      it('should have recorded request in queue', function(){
        expect(target.queue).to.have.length(1);
      });

      it('should not send request immediately', function(){
        expect(handlers.handle).to.not.be.called;
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
      linkData = {
        id: '11111',
        type: 'object',
        poolId: '22222'
      };
      deferred.resolve(linkData);
      deferred.promise.then(function() {
        done();
      });
    });
    describe('When making child request', function() { // handle immediately

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
    describe('When making child request', function() { // reject immediately

    });
  });
  describe('When destroyed', function() {
    describe('When making child request', function() { // reject immediately

    });
  });
  describe('When request sent', function() {

  });
});
