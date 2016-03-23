describe('RequestTarget', function() {
  var sandbox;
  before(function() {
    sandbox = sinon.sandbox.create();
  });
  after(function() {
    sandbox.restore();
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
  });
  describe('create()', function() {

  });
});
