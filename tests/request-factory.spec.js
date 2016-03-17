'use strict';
describe('RequestFactory', function() {
  var sandbox, resource, factory, decorator, handlers;
  beforeEach(function() {
    handlers = {
      available: true
    };
    sandbox = sinon.sandbox.create();
    decorator = {
      decorate: sinon.spy()
    };
    resource = {};
    sandbox.stub(RequestTarget, 'create').returns(resource);
    sandbox.stub(RequestTargetDecorator, 'create').returns(decorator);
    factory = RequestFactory.create(handlers);
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe('create()', function() {
    var result;
    beforeEach(function() {
      result = factory.create(Promise.reject());
    });

    it('should create RequestTarget', function() {
      expect(RequestTarget.create).to.be.calledOnce;
      expect(result).to.be.equal(resource);
    });

    it('should pass promise and handlers to request', function() {
      var args = RequestTarget.create.getCall(0);
      console.log(args);
      expect(args[0]).to.be.an.instanceof(Promise);
      expect(args[1]).to.be.equal(handlers);
    });

    it('should call decorator', function() {
      expect(decorator.decorate).to.be.calledOnce;
      expect(decorator.decorate.getCall(0).args[0]).to.be.equal(result);
    });
  });

});
