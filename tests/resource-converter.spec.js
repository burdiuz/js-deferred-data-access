describe('ResourceConverter', function() {
  /**
   * @type {ResourceConverter}
   */
  var converter;
  var factory, registry, pool, handlers;
  var sandbox;
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
      isRegistered: sandbox.spy(function() {
        return isRegistered;
      }),
      get: sandbox.spy(function() {
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
    describe('When Array passed', function() {
      var source, result, actualResult;
      beforeEach(function() {
        source = [{}];
        result = [{}];
        sandbox.stub(converter, 'lookupArray').returns(result);
        actualResult = converter.toJSON(source);
      });
      it('should call lookupArray() once', function() {
        expect(converter.lookupArray).to.be.calledOnce;
      });
      it('should pass to lookupArray() data and handler', function() {
        var args = converter.lookupArray.getCall(0).args;
        expect(args[0]).to.be.equal(source);
        expect(args[1]).to.be.equal(converter.resourceToObject);
      });
      it('should return result of array processing', function() {
        expect(actualResult).to.be.equal(result);
      });
    });
    describe('When Object passed', function() {
      describe('When RAW Object passed', function() {
        var source, result, actualResult;
        beforeEach(function() {
          source = {data: {}};
          result = {};
          sandbox.stub(converter, 'lookupObject').returns(result);
          actualResult = converter.toJSON(source);
        });
        it('should call lookupObject() once', function() {
          expect(converter.lookupObject).to.be.calledOnce;
        });
        it('should pass to lookupObject() data and handler', function() {
          var args = converter.lookupObject.getCall(0).args;
          expect(args[0]).to.be.equal(source);
          expect(args[1]).to.be.equal(converter.resourceToObject);
        });
        it('should return result of hash processing', function() {
          expect(actualResult).to.be.equal(result);
        });
      });
      describe('When extended Object passed', function() {
        var classFunc, source, result;
        beforeEach(function() {
          classFunc = function() {
          };
          source = new classFunc();
          result = converter.toJSON(source);
        });
        it('should skip data processing', function() {
          expect(result).to.be.equal(source);
        });
      });
      describe('When IConvertible passed', function() {
        var source, result, actualResult;
        beforeEach(function() {
          source = new IConvertible();
          result = {data: 'something'};
          sandbox.stub(converter, 'resourceToObject').returns(result);
          actualResult = converter.toJSON(source);
        });
        it('should call resourceToObject() once', function() {
          expect(converter.resourceToObject).to.be.calledOnce;
        });
        it('should pass to resourceToObject() data', function() {
          var args = converter.resourceToObject.getCall(0).args;
          expect(args[0]).to.be.equal(source);
        });
        it('should result into RAW resource', function() {
          expect(actualResult).to.be.equal(result);
        });
      });
      describe('When Function passed', function() {
        var source, result, actualResult;
        beforeEach(function() {
          source = function() {
          };
          result = {data: 'something'};
          sandbox.stub(converter, 'resourceToObject').returns(result);
          actualResult = converter.toJSON(source);
        });
        it('should call resourceToObject() once', function() {
          expect(converter.resourceToObject).to.be.calledOnce;
        });
        it('should pass to resourceToObject() data', function() {
          var args = converter.resourceToObject.getCall(0).args;
          expect(args[0]).to.be.equal(source);
        });
        it('should result into RAW resource', function() {
          expect(actualResult).to.be.equal(result);
        });
      });
      describe('When Resource passed', function() {
        var source, result, actualResult;
        beforeEach(function() {
          source = __createTargetResource();
          result = {data: 'something'};
          sandbox.stub(converter, 'resourceToObject').returns(result);
          actualResult = converter.toJSON(source);
        });
        it('should call resourceToObject() once', function() {
          expect(converter.resourceToObject).to.be.calledOnce;
        });
        it('should pass to resourceToObject() data', function() {
          var args = converter.resourceToObject.getCall(0).args;
          expect(args[0]).to.be.equal(source);
        });
        it('should result into RAW resource', function() {
          expect(actualResult).to.be.equal(result);
        });
      });
    });
  });

  describe('parse()', function() {
    describe('When Array passed', function() {
      var source, result, actualResult;
      beforeEach(function() {
        source = [{}];
        result = [{}];
        sandbox.stub(converter, 'lookupArray').returns(result);
        actualResult = converter.parse(source);
      });
      it('should call lookupArray() once', function() {
        expect(converter.lookupArray).to.be.calledOnce;
      });
      it('should pass to lookupArray() data and handler', function() {
        var args = converter.lookupArray.getCall(0).args;
        expect(args[0]).to.be.equal(source);
        expect(args[1]).to.be.equal(converter.objectToResource);
      });
      it('should return result of array processing', function() {
        expect(actualResult).to.be.equal(result);
      });
    });
    describe('When Object passed', function() {
      describe('When RAW Object passed', function() {
        var source, result, actualResult;
        beforeEach(function() {
          source = {data: {}};
          result = {};
          sandbox.stub(converter, 'lookupObject').returns(result);
          actualResult = converter.parse(source);
        });
        it('should call lookupObject() once', function() {
          expect(converter.lookupObject).to.be.calledOnce;
        });
        it('should pass to lookupObject() data and handler', function() {
          var args = converter.lookupObject.getCall(0).args;
          expect(args[0]).to.be.equal(source);
          expect(args[1]).to.be.equal(converter.objectToResource);
        });
        it('should return result of hash processing', function() {
          expect(actualResult).to.be.equal(result);
        });
      });
      describe('When Resource Object passed', function() {
        var source, result, actualResult;
        beforeEach(function() {
          source = __createTargetResourceData();
          result = {data: 'something'};
          sandbox.stub(converter, 'objectToResource').returns(result);
          actualResult = converter.parse(source);
        });
        it('should call objectToResource() once', function() {
          expect(converter.objectToResource).to.be.calledOnce;
        });
        it('should pass to objectToResource() data', function() {
          var args = converter.objectToResource.getCall(0).args;
          expect(args[0]).to.be.equal(source);
        });
        it('should result into resolved resource target', function() {
          expect(actualResult).to.be.equal(result);
        });
      });
    });
  });

  describe('lookupArray()', function() {
    var handler, result;
    beforeEach(function() {
      handler = sandbox.spy(function(num) {
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
      handler = sandbox.spy(function(num) {
        return ++num;
      });
      function MyClass(){}
      MyClass.prototype.one1 = 1;
      MyClass.prototype.two2 = 2;
      MyClass.prototype.three3 = 3;
      var object = new MyClass();
      object.one = 1;
      object.two = 2;
      object.three = 3;
      result = converter.lookupObject(object, handler);
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
      assert(one != two && two != three && one != three, 'each value passed once');
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
    describe('When Pending resource passed', function() {
      var source, result;
      beforeEach(function() {
        source = __createRequestTarget();
        //sandbox.stub(RequestTarget, 'isPending').returns(true);
        result = converter.lookupForPending(source);
      });
      it('should result in list with only source object in it', function() {
        expect(result[0]).to.be.equal(source);
      });
    });
    describe('When Resolved resource passed', function() {
      var source, result, promise;
      beforeEach(function(done) {
        promise = __createDataResolvedPromise();
        source = __createRequestTarget(promise);
        promise.then(function() {
          result = converter.lookupForPending();
          done();
        });
      });
      it('should result in empty list', function() {
        expect(result).to.be.empty;
      });
    });
    describe('When Array of Pending resources passed', function() {
      var source, result;
      beforeEach(function() {
        source = [{}, {}, __createRequestTarget(), {}, __createRequestTarget(), {}, {}, __createRequestTarget()];
        result = converter.lookupForPending(source);
      });
      it('should result in list with only source object in it', function() {
        expect(result).to.have.length(3);
        expect(result[0]).to.be.an.instanceof(RequestTarget);
        expect(result[1]).to.be.an.instanceof(RequestTarget);
        expect(result[2]).to.be.an.instanceof(RequestTarget);
      });
    });
    describe('When Hash of Pending resources passed', function() {
      var source, result;
      beforeEach(function() {
        source = {
          first: {},
          second: function() {
          },
          third: new IConvertible(),
          fourth: {},
          fifth: __createRequestTarget(),
          sixth: {},
          seventh: {},
          eighth: __createRequestTarget()
        };
        result = converter.lookupForPending(source);
      });
      it('should result in list with only source object in it', function() {
        expect(result).to.have.length(2);
        expect(result[0]).to.be.an.instanceof(RequestTarget);
        expect(result[1]).to.be.an.instanceof(RequestTarget);
      });
    });
  });

  describe('resourceToObject()', function() {
    var source, result, referenceResult, listener;
    beforeEach(function() {
      listener = sandbox.spy();
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
          toJSON: sandbox.spy(function() {
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
      listener = sandbox.spy();
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
