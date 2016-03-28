describe('RequestTarget', function() {
  var sandbox, _RequestTargetInternals;
  before(function() {
    _RequestTargetInternals = RequestTargetInternals;
    sandbox = sinon.sandbox.create();
    RequestTargetInternals = sandbox.spy(function() {
      this.then = sinon.spy();
      this.catch = sinon.spy();
    });
  });
  after(function() {
    RequestTargetInternals = _RequestTargetInternals;
    sandbox.restore();
  });

  describe('When created', function() {
    var deferred, promise, request, handlers;
    beforeEach(function() {
      deferred = new Deferred();
      promise = deferred.promise;
      handlers = {};
      RequestTargetInternals.reset();
      request = new RequestTarget(promise, handlers);
    });
    it('should create *Internals', function() {
      assert(RequestTargetInternals.calledWithNew(), 'internals was created');
      expect(RequestTargetInternals).to.be.calledWith(request, promise, handlers);
    });
    it('should store *Internals', function() {
      expect(request[TARGET_INTERNALS]).to.be.an.instanceof(RequestTargetInternals);
    });
    describe('When subscribe', function() {
      it('then() should call internal method', function() {
        request.then(function() {
        });
        expect(request[TARGET_INTERNALS].then).to.be.calledOnce;
      });
      it('catch() should call internal method', function() {
        request.catch(function() {
        });
        expect(request[TARGET_INTERNALS].catch).to.be.calledOnce;
      });
    });
    describe('When resolved as resource', function() {
      beforeEach(function(done) {
        deferred.resolve(__createRequestTargetData());
        deferred.promise.then(function() {
          done();
        });
      });
      it('should keep internals', function() {
        expect(request[TARGET_INTERNALS]).to.be.an.instanceof(RequestTargetInternals);
      });
    });
    describe('When resolved as not a resource', function() {
      beforeEach(function(done) {
        deferred.resolve('-data3');
        deferred.promise.then(function() {
          done();
        });
      });
      it('should delete internals', function() {
        expect(request[TARGET_INTERNALS]).to.not.be.ok;
      });
     it('calling then() should subscribe to original promise', function(done) {
        request.then(function(data) {
          expect(data).to.be.equal('-data3');
          done();
        });
      });
    });
    describe('When rejected', function() {
      beforeEach(function(done) {
        deferred.reject('error data');
        deferred.promise.catch(function() {
          done();
        });
      });
      it('should delete internals', function() {
        expect(request[TARGET_INTERNALS]).to.not.be.ok;
      });
      it('calling catch() should subscribe to original promise', function(done) {
        request.catch(function(data) {
          expect(data).to.be.equal('error data');
          done();
        });
      });
    });
  });

  describe('isActive()', function() {
    var target, isActive, result;
    beforeEach(function() {
      target = {};
      isActive = sandbox.stub().returns(false);
      target[TARGET_INTERNALS] = {
        isActive: isActive
      };
      result = RequestTarget.isActive(target);
    });
    it('should call internal function', function() {
      expect(isActive).to.be.calledOnce;
    });
    it('should return call result', function() {
      expect(result).to.be.false;
    });
    it('should be false for non-Resource target', function() {
      expect(RequestTarget.isActive({})).to.be.false;
    });
  });
  describe('canBeDestroyed()', function() {
    var target, canBeDestroyed, result;
    beforeEach(function() {
      target = {};
      canBeDestroyed = sandbox.stub().returns(true);
      target[TARGET_INTERNALS] = {
        canBeDestroyed: canBeDestroyed
      };
      result = RequestTarget.canBeDestroyed(target);
    });
    it('should call internal function', function() {
      expect(canBeDestroyed).to.be.calledOnce;
    });
    it('should return call result', function() {
      expect(result).to.be.true;
    });
    it('should be false for non-Resource target', function() {
      expect(RequestTarget.canBeDestroyed({})).to.be.false;
    });
  });
  describe('destroy()', function() {
    var target, destroy, result;
    beforeEach(function() {
      target = {};
      destroy = sandbox.stub().returns({});
      target[TARGET_INTERNALS] = {
        destroy: destroy
      };
      result = RequestTarget.destroy(target);
    });
    it('should call internal function', function() {
      expect(destroy).to.be.calledOnce;
    });
    it('should return call result', function() {
      expect(result).to.be.an('object');
    });
    it('should return null for non-Resource target', function() {
      expect(RequestTarget.destroy({})).to.be.null;
    });
  });
  describe('toJSON()', function() {
    var target, toJSON, result;
    beforeEach(function() {
      target = {};
      toJSON = sandbox.stub().returns({});
      target[TARGET_INTERNALS] = {
        toJSON: toJSON
      };
      result = RequestTarget.toJSON(target);
    });
    it('should call internal function', function() {
      expect(toJSON).to.be.calledOnce;
    });
    it('should return call result', function() {
      expect(result).to.be.an('object');
    });
    it('should return null for non-Resource target', function() {
      expect(RequestTarget.toJSON({})).to.be.null;
    });
  });
  describe('isPending()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        status: TargetStatus.PENDING
      };
      result = RequestTarget.isPending(target);
    });
    it('should result with TRUE if status is "pending"', function() {
      expect(result).to.be.true;
    });
    it('should be false for non-Resource target', function() {
      expect(RequestTarget.isPending({})).to.be.false;
    });
  });
  describe('isTemporary()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        temporary: true
      };
      result = RequestTarget.isTemporary(target);
    });
    it('should result with TRUE if target is temporary', function() {
      expect(result).to.be.true;
    });
    it('should be undefined for non-Resource target', function() {
      expect(RequestTarget.isTemporary({})).to.be.undefined;
    });
  });
  describe('setTemporary()', function() {
    var target;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        temporary: false
      };
      RequestTarget.setTemporary(target, true);
    });
    it('should update "temporary" value', function() {
      expect(target[TARGET_INTERNALS].temporary).to.be.true;
    });
    it('should silently skip for non-Resource', function() {
      var target = {};
      RequestTarget.setTemporary(target, true);
      expect(target).to.not.have.property('temporary');
    });
  });
  describe('getStatus()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        status: TargetStatus.DESTROYED
      };
      result = RequestTarget.getStatus(target);
    });
    it('should result with target status', function() {
      expect(result).to.be.equal(TargetStatus.DESTROYED);
    });
    it('should return null for non-Resource target', function() {
      expect(RequestTarget.getStatus({})).to.be.null;
    });
  });
  describe('getQueueLength()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        queue: [{}, {}, {}, {}]
      };
      result = RequestTarget.getQueueLength(target);
    });
    it('should result with queue length', function() {
      expect(result).to.be.equal(4);
    });
    it('should return 0 for non-Resource target', function() {
      expect(RequestTarget.getQueueLength({})).to.be.equal(0);
    });
  });
  describe('getQueueCommands()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        // queue has format [ [command, deferred], [command, deferred], [command, deferred], ...  ]
        queue: [[{type: 'abc'}], [{type: 'def'}], [{type: 'ghi'}], [{type: 'jkl'}]]
      };
      result = RequestTarget.getQueueCommands(target);
    });
    it('should result with command types from queue', function() {
      expect(result).to.be.eql(['abc', 'def', 'ghi', 'jkl']);
    });
    it('should return empty list for non-Resource target', function() {
      expect(RequestTarget.getQueueCommands({})).to.be.empty;
    });
  });
  describe('hadChildPromises()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        hadChildPromises: false
      };
      result = RequestTarget.hadChildPromises(target);
    });
    it('should result with internal hadChildPromises value', function() {
      expect(result).to.be.false;
    });
    it('should be undefined for non-Resource target', function() {
      expect(RequestTarget.hadChildPromises({})).to.be.false;
    });
  });
  describe('getRawPromise()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        promise: {}
      };
      result = RequestTarget.getRawPromise(target);
    });
    it('should result with targets promise', function() {
      expect(result).to.be.equal(target[TARGET_INTERNALS].promise);
    });
    it('should be null for non-Resource target', function() {
      expect(RequestTarget.getRawPromise({})).to.be.null;
    });
  });
  describe('getChildren()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        children: [{}, {}, {}]
      };
      result = RequestTarget.getChildren(target);
    });
    it('should result with list of children requests', function() {
      expect(result).to.have.length(3);
    });
    it('should be empty list for non-Resource target', function() {
      expect(RequestTarget.getChildren({})).to.be.empty;
    });
  });
  describe('getLastChild()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        children: [{}, {}, {}]
      };
      result = RequestTarget.getLastChild(target);
    });
    it('should result with last item from children', function() {
      expect(result).to.be.equal(target[TARGET_INTERNALS].children.pop());
    });
  });
  describe('getChildrenCount()', function() {
    var target, result;
    beforeEach(function() {
      target = {};
      target[TARGET_INTERNALS] = {
        children: [{}, {}, {}]
      };
      result = RequestTarget.getChildrenCount(target);
    });
    it('should result with children count', function() {
      expect(result).to.be.equal(3);
    });
    it('should be 0 for non-Resource target', function() {
      expect(RequestTarget.getChildrenCount({})).to.be.equal(0);
    });
  });
  describe('create()', function() {
    it('should create instance of RequestTarget', function() {
      expect(RequestTarget.create(Promise.reject(), {})).to.be.an.instanceof(RequestTarget);
    });
  });
});
