/**
 * Created by Oleg Galaburda on 03.03.16.
 */
describe('ResourcePool', function() {
  /**
   * @type {ResourcePool}
   */
  var pool, target1, target2, resource1, resource2;
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    pool = new ResourcePool();
    resource1 = pool.set(target1 = {});
    resource2 = pool.set(target2 = {});
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('When created', function() {
    it('should have own ID', function() {
      expect(pool.id).to.be.a('string');
    });
    it('should be active', function() {
      expect(pool.isActive()).to.be.true;
    });
  });

  describe('When adding target', function() {
    var target = {}, result;

    describe('When adding new', function() {
      var listener;
      beforeEach(function() {
        listener = sandbox.spy();
        pool.addEventListener(ResourcePool.Events.RESOURCE_ADDED, listener);
        result = pool.set(target);
      });

      it('should return instance of TargetResource', function() {
        expect(result).to.be.an.instanceof(TargetResource);
      });

      it('should fire event "' + ResourcePool.Events.RESOURCE_ADDED + '"', function() {
        expect(listener).to.be.calledOnce;
      });

      it('should fire event with resource target data', function() {
        var data = listener.getCall(0).args[0].data;
        expect(data).to.be.equal(result);
      });

      describe('When adding with custom type', function() {
        var target, type, resource;
        beforeEach(function() {
          target = {};
          type = 'target-type';
          resource = pool.set(target, type);
        });
        it('should keep custom target type', function() {
          expect(resource.type).to.be.equal(type);
        });
      });

      describe('When adding already existing', function() {
        var nextResult;
        beforeEach(function() {
          listener.reset();
          nextResult = pool.set(target);
        });
        it('should return same TargetResource instance', function() {
          expect(nextResult).to.be.equal(result);
        });

        it('should not fire event "' + ResourcePool.Events.RESOURCE_ADDED + '"', function() {
          expect(listener).to.not.be.called;
        });
      });

      describe('When adding Resource type', function() {
        it('should not store to pool RequestTarget', function() {
          expect(pool.set(__createRequestTarget())).to.be.null;
        });
        it('should not store to pool RequestTarget wrapped with Proxy', function() {
          expect(pool.set(__createRequestTargetProxy())).to.be.null;

        });
        it('should not store to pool TargetResource', function() {
          expect(pool.set(__createTargetResource())).to.be.null;
        });
        it('should not store to pool RAW resource', function() {
          var target = {};
          target[TARGET_DATA] = {};
          expect(pool.set(target)).to.be.null;
        });
      });
    });
  });

  describe('When looking for target', function() {

    it('should return true for added targets', function() {
      expect(pool.has(target1)).to.be.true;
      expect(pool.has(target2)).to.be.true;
    });

    it('should return false for unknown targets', function() {
      expect(pool.has({})).to.be.false;
      expect(pool.has('1111')).to.be.false;
    });

  });

  describe('When requesting target', function() {
    it('should return proper resource object by target', function() {
      expect(pool.get(target1)).to.be.equal(resource1);
      expect(pool.get(target2)).to.be.equal(resource2);
    });

    it('should return proper resource object by id', function() {
      expect(pool.get(resource1.id)).to.be.equal(resource1);
      expect(pool.get(resource2.id)).to.be.equal(resource2);
    });

    describe('When looking for non-existent target', function() {
      it('should return `undefined` for not found targets', function() {
        expect(pool.get({})).to.be.undefined;
      });
    });
  });

  describe('When removing target', function() {
    var listener, active;
    beforeEach(function() {
      active = undefined;
      listener = sandbox.spy(function(event) {
        active = event.data.active;
      });
      pool.addEventListener(ResourcePool.Events.RESOURCE_REMOVED, listener);
      sandbox.spy(resource1, 'destroy');
      pool.remove(target1);
    });
    afterEach(function() {
      resource1.destroy.restore();
    });
    it('removed target should be excluded from pool', function() {
      expect(pool.has(target1)).to.be.false;
      expect(pool.has(target2)).to.be.true;
    });
    it('should fire event "' + ResourcePool.Events.RESOURCE_REMOVED + '"', function() {
      expect(listener).to.be.calledOnce;
    });
    it('should fire event with resource as event data', function() {
      var data = listener.getCall(0).args[0].data;
      expect(data).to.be.equal(resource1);
    });
    it('resource should be active when event fired', function() {
      expect(active).to.be.true;
    });
    it('resource should be destroyed immediately after event fired', function() {
      expect(resource1.active).to.be.false;
    });
  });

  describe('When clearing pool', function() {
    var beforeListener, afterListener, beforeActive, beforeExists, afterActive, afterExists;
    beforeEach(function() {
      beforeListener = sandbox.spy(function() {
        beforeActive = resource1.active;
        beforeExists = pool.has(target2);
      });
      afterListener = sandbox.spy(function() {
        afterActive = resource2.active;
        afterExists = pool.has(target1);
      });
      pool.addEventListener(ResourcePool.Events.POOL_CLEAR, beforeListener);
      pool.addEventListener(ResourcePool.Events.POOL_CLEARED, afterListener);
      pool.clear();
    });

    it('should fire "' + ResourcePool.Events.POOL_CLEAR + '" event', function() {
      expect(beforeListener).to.be.calledOnce;
    });

    it('"' + ResourcePool.Events.POOL_CLEAR + '" event should target to own pool', function() {
      expect(beforeListener.getCall(0).args[0].data).to.be.equal(pool);
    });

    it('should fire "' + ResourcePool.Events.POOL_CLEAR + '" event before destroying resources', function() {
      expect(beforeActive).to.be.true;
      expect(beforeExists).to.be.true;
    });

    it('should fire "' + ResourcePool.Events.POOL_CLEARED + '" event', function() {
      expect(beforeListener).to.be.calledOnce;
    });

    it('"' + ResourcePool.Events.POOL_CLEARED + '" event should target to own pool', function() {
      expect(afterListener.getCall(0).args[0].data).to.be.equal(pool);
    });

    it('should fire "' + ResourcePool.Events.POOL_CLEARED + '" event after resources destroyed', function() {
      expect(afterActive).to.be.false;
      expect(afterExists).to.be.false;
    });

    it('should fire events in order', function() {
      sinon.assert.callOrder(beforeListener, afterListener);
    });

    it('should exclude targets', function() {
      expect(pool.has(target1)).to.be.false;
      expect(pool.has(target2)).to.be.false;
    });

    it('should destroy resources', function() {
      expect(resource1.active).to.be.false;
      expect(resource2.active).to.be.false;
    });

    it('should allow re-adding same targets', function() {
      expect(pool.set(target1)).to.not.be.equal(resource1);
      expect(pool.set(target2)).to.not.be.equal(resource2);
    });

  });

  describe('When destroying pool', function() {
    var clearedListener, destroyedListener;
    beforeEach(function() {
      clearedListener = sandbox.spy();
      destroyedListener = sandbox.spy();
      sandbox.spy(pool, 'clear');
      pool.addEventListener(ResourcePool.Events.POOL_CLEARED, clearedListener);
      pool.addEventListener(ResourcePool.Events.POOL_DESTROYED, destroyedListener);
      pool.destroy();
    });
    it('should become inactive', function() {
      expect(pool.isActive()).to.be.false;
    });
    it('should clear() pool', function() {
      expect(pool.clear).to.be.calledOnce;
    });
    it('should fire "' + ResourcePool.Events.POOL_DESTROYED + '" event', function() {
      expect(destroyedListener).to.be.calledOnce;
    });
    it('should fire events in order', function() {
      sinon.assert.callOrder(clearedListener, destroyedListener);
    });
    describe('When trying to use destroyed pool', function() {
      it('should cause error', function() {
        expect(function() {
          pool.set({});
        }).to.throw(Error);
      });
    });
  });

  describe('isValidTarget()', function() {
    beforeEach(function() {
      ResourcePool.setValidTargets(['object']);
    });
    afterEach(function() {
      ResourcePool.setValidTargets(ResourcePool.getDefaultValidTargets());
    });
    it('should say valid for stored target types', function() {
      expect(ResourcePool.isValidTarget({})).to.be.true;
      expect(ResourcePool.isValidTarget(function() {
      })).to.be.false;
    });
  });

  describe('setValidTargets()', function() {
    beforeEach(function() {
      ResourcePool.setValidTargets([]);
    });
    afterEach(function() {
      ResourcePool.setValidTargets(ResourcePool.getDefaultValidTargets());
    });
    it('should apply passed list of targets', function() {
      expect(ResourcePool.isValidTarget({})).to.be.false;
      ResourcePool.setValidTargets(['object']);
      expect(ResourcePool.isValidTarget({})).to.be.true;
      expect(ResourcePool.isValidTarget(function() {
      })).to.be.false;
      ResourcePool.setValidTargets(['function']);
      expect(ResourcePool.isValidTarget({})).to.be.false;
      expect(ResourcePool.isValidTarget(function() {
      })).to.be.true;
    });
  });

  describe('getDefaultValidTargets()', function() {
    it('should contain list of strings', function() {
      expect(ResourcePool.getDefaultValidTargets()).to.be.an.instanceof(Array);
      expect(ResourcePool.getDefaultValidTargets()[0]).to.be.a('string');
    });
  });

  describe('create()', function() {
    it('should return an instance of ResourcePool', function() {
      expect(ResourcePool.create()).to.be.an.instanceof(ResourcePool);
    });
  });
});
