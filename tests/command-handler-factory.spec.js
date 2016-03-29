/**
 * Created by Oleg Galaburda on 29.03.16.
 */
describe('CommandHandlerFactory', function() {
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
