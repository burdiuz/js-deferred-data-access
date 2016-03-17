describe('ResourceConverter', function() {
  var converter, factory, registry, pool, handlers, sandbox;
  var isRegistered, requestTarget, targetResource;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    factory = {
      create: sandbox.spy(function() {
        return requestTarget;
      })
    };
    pool = {
      get: sandbox.spy(function() {
        return targetResource;
      }),
      set: sandbox.spy(function() {
        return targetResource;
      })
    };
    registry = {
      isRegistered: sinon.spy(function() {
        return isRegistered;
      }),
      get: sinon.spy(function() {
        return pool;
      })
    };
    handlers = {
      setConverter: sandbox.spy()
    };
    converter = ResourceConverter.create(factory, registry, pool, handlers);
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe('When created', function() {
    it('should apply itself to RequestHandlers', function() {
      expect(handlers.setConverter).to.be.calledOnce;
    });
  });


  describe('toJSON()', function() {

  });

  describe('parse()', function() {

  });

  describe('lookupArray()', function() {
    var handler, result;
    beforeEach(function() {
      handler = sinon.spy(function(num) {
        return --num;
      });
      result = converter.lookupArray([1, 2, 3], handler);
    });
    it('should call handler for each value', function() {
      expect(handler).to.be.calledThrice;
    });
    it('should pass values into handler', function() {
      var one = handler.getCall(0).args[0];
      var two = handler.getCall(1).args[0];
      var three = handler.getCall(2).args[0];
      expect([1, 2, 3]).to.include(one);
      expect([1, 2, 3]).to.include(two);
      expect([1, 2, 3]).to.include(three);
      assert(one != two != three, 'each value passed once');
    });
    it('should apply handler to converter', function() {
      expect(handler).to.be.calledOn(converter);
    });
    it('should apply result to final object', function() {
      expect(result).to.be.eql([0, 1, 2]);
    });
  });

  describe('lookupObject()', function() {
    var handler, result;
    beforeEach(function() {
      handler = sinon.spy(function(num) {
        return ++num;
      });
      result = converter.lookupObject({one: 1, two: 2, three: 3}, handler);
    });
    it('should call handler for each value', function() {
      expect(handler).to.be.calledThrice;
    });
    it('should pass values into handler', function() {
      var one = handler.getCall(0).args[0];
      var two = handler.getCall(1).args[0];
      var three = handler.getCall(2).args[0];
      expect([1, 2, 3]).to.include(one);
      expect([1, 2, 3]).to.include(two);
      expect([1, 2, 3]).to.include(three);
      assert(one != two != three, 'each value passed once');
    });
    it('should apply handler to converter', function() {
      expect(handler).to.be.calledOn(converter);
    });
    it('should apply result to final object', function() {
      expect(result).to.be.eql({
        one: 2, two: 3, three: 4
      });
    });
  });

  describe('lookupForPending()', function() {

  });

  describe('resourceToObject()', function() {
    var source, result, referenceResult, listener;
    beforeEach(function() {
      listener = sinon.spy();
      converter.addEventListener(ResourceConverter.Events.RESOURCE_CONVERTED, listener);
    });

    function addCases() {
      it('should generate proper result', function() {
        expect(result).to.be.eql(referenceResult);
      });
      it('should fire CONVERTED event', function() {
        expect(listener).to.be.calledOnce;
      });
      it('should pass with event resource and generated data', function() {
        var event = listener.getCall(0).args[0];
        expect(event.data.data).to.be.equal(source);
        expect(event.data.result).to.be.equal(result);
      });
    }

    describe('When passing RequestTarget', function() {
      beforeEach(function(done) {
        var promise = __createDataResolvedPromise();
        source = __createRequestTarget(promise);
        referenceResult = __createRequestTargetData();
        promise.then(function() {
          result = converter.resourceToObject(source);
          done();
        });
      });
      addCases();
    });
    describe('When passing TargetResource', function() {
      beforeEach(function() {
        source = __createTargetResource();
        referenceResult = __createTargetResourceData();
        result = converter.resourceToObject(source);
      });
      addCases();
    });
    describe('When passing RAW Resource', function() {
      beforeEach(function() {
        source = __createRequestTargetData();
        result = converter.resourceToObject(source);
      });
      it('should not fire event', function() {
        expect(listener).to.not.be.called;
      });
      it('result should equal to source', function() {
        expect(result).to.be.equal(source);
      });
    });
    describe('When passing Function', function() {
      beforeEach(function() {
        source = function() {
        };
        targetResource = __createTargetResource();
        referenceResult = __createTargetResourceData();
        result = converter.resourceToObject(source);
      });
      addCases();
    });
    describe('When passing IConvertible instance', function() {
      beforeEach(function() {
        source = new IConvertible();
        targetResource = __createTargetResource();
        referenceResult = __createTargetResourceData();
        result = converter.resourceToObject(source);
      });
      addCases();
    });
    describe('When passing toJSON() owner', function() {
      beforeEach(function() {
        source = {
          anything: '1111',
          toJSON: sinon.spy(function() {
            return {evenMore: 'anything'};
          })
        };
        referenceResult = {evenMore: 'anything'};
        result = converter.resourceToObject(source);
      });
      addCases();
    });
    describe('When passing any object', function() {
      beforeEach(function() {
        source = {anything: '1111'};
        result = converter.resourceToObject(source);
      });
      it('should not fire event', function() {
        expect(listener).to.not.be.called;
      });
      it('result should equal to source', function() {
        expect(result).to.be.equal(source);
      });
    });
  });

  describe('objectToResource()', function() {
    var source, result, referenceResult, listener;
    beforeEach(function() {
      listener = sinon.spy();
      converter.addEventListener(ResourceConverter.Events.RESOURCE_CREATED, listener);
    });

    function addCases() {
      it('should generate proper result', function() {
        expect(result).to.be.equal(referenceResult);
      });
      it('should fire CREATED event', function() {
        expect(listener).to.be.calledOnce;
      });
      it('should pass with event original data and resource', function() {
        var event = listener.getCall(0).args[0];
        expect(event.data.data).to.be.equal(source);
        expect(event.data.result).to.be.equal(result);
      });
    }

    describe('When has pool with resource poolId', function() {
      beforeEach(function() {
        source = __createTargetResourceData();
        isRegistered = true;
        referenceResult = {resource: 'target'};
        targetResource = __createTargetResource(referenceResult);
        result = converter.objectToResource(source);
      });
      it('Pool registry should be called with poolId', function() {
        expect(registry.isRegistered).to.be.calledOnce;
        expect(registry.isRegistered).to.be.calledWith(getResourcePoolId(source));
        expect(registry.get).to.be.calledOnce;
        expect(registry.get).to.be.calledWith(getResourcePoolId(source));
      });
      it('Pool should be called with resource Id', function() {
        expect(pool.get).to.be.calledOnce;
        expect(pool.get).to.be.calledWith(getResourceId(source));
      });
      addCases();
    });

    describe('When does not have pool with resource poolId', function() {
      beforeEach(function() {
        source = __createTargetResourceData();
        isRegistered = false;
        requestTarget = __createRequestTarget();
        referenceResult = requestTarget;
        result = converter.objectToResource(source);
      });
      it('should pass source data to factory', function() {
        expect(factory.create).to.be.calledOnce;
        expect(factory.create.getCall(0).args[0]).to.be.an.instanceof(Promise);
      });
      addCases();
    });

    describe('When not a resource passed', function() {
      beforeEach(function() {
        source = {
          just: 'any stuff'
        };
        result = converter.objectToResource(source);
      });
      it('should not fire event', function() {
        expect(listener).to.not.be.called;
      });
      it('result should equal to source', function() {
        expect(result).to.be.equal(source);
      });
    });

  });

});
