describe('ResourcePoolRegistry', function() {
  var registry;
  /**
   * @type {ResourcePool}
   */
  var pool;
  beforeEach(function() {
    registry = new ResourcePoolRegistry();
    pool = registry.createPool();
  });

  describe('createPool()', function() {
    var pool1, listener;
    beforeEach(function() {
      listener = sinon.spy();
      registry.addEventListener(ResourcePoolRegistry.Events.RESOURCE_POOL_CREATED, listener);
      pool1 = registry.createPool();
    });
    it('should return new ResourcePool instance', function() {
      expect(pool1).to.be.an.instanceof(ResourcePool);
      expect(pool1).to.not.be.equal(pool);
    });
    it('should fire "' + ResourcePoolRegistry.Events.RESOURCE_POOL_CREATED + '" event', function() {
      expect(listener).to.be.calledOnce;
    });
    it('should fire event with pool stored as data', function() {
      expect(listener.getCall(0).args[0].data).to.be.equal(pool1);
    });
    it('should register new ResourcePool', function() {
      expect(registry.isRegistered(pool)).to.be.true;
      expect(registry.isRegistered(pool1)).to.be.true;
    });
  });

  describe('When registering pool', function() {
    var pool1, listener;
    beforeEach(function() {
      listener = sinon.spy();
      pool1 = ResourcePool.create();
      registry.addEventListener(ResourcePoolRegistry.Events.RESOURCE_POOL_REGISTERED, listener);
      registry.register(pool1);
    });
    it('ResourcePool should be available from registry', function() {
      expect(registry.isRegistered(pool1)).to.be.true;
      expect(registry.get(pool1.id)).to.be.equal(pool1);
    });
    it('should fire "' + ResourcePoolRegistry.Events.RESOURCE_POOL_REGISTERED + '" event', function() {
      expect(listener).to.be.calledOnce;
    });
    it('should fire event with pool stored as data', function() {
      expect(listener.getCall(0).args[0].data).to.be.equal(pool1);
    });

    describe('When registering twice', function() {
      beforeEach(function() {
        registry.register(pool1);
      });
      it('ResourcePool registration should remain', function() {
        expect(registry.isRegistered(pool1)).to.be.true;
      });
      it('should not fire event second time', function() {
        expect(listener).to.be.calledOnce;
      });
    });

  });

  describe('When accessing pool', function() {
    it('should be accessible by ID', function() {
      expect(registry.get(pool.id)).to.be.equal(pool);
    });

    describe('When accessing non-existent pool', function() {
      it('should return null', function() {
        expect(registry.get('111111')).to.be.null;
      });
    });

  });

  describe('When check if pool exists', function() {
    it('should be available by ID', function() {
      expect(registry.isRegistered(pool.id)).to.be.true;
    });
    it('should be available by instance', function() {
      expect(registry.isRegistered(pool)).to.be.true;
    });
    it('should be false for non-existent pool', function() {
      expect(registry.isRegistered('1010101')).to.be.false;
    });
  });

  describe('When destroying pool', function() {
    beforeEach(function() {
      pool.destroy();
    });
    it('should listen to destroy event and remove pool from registry', function() {
      expect(registry.isRegistered(pool)).to.be.false;
    });
  });

  describe('When removing pool', function() {
    var pool1, listener;
    beforeEach(function() {
      listener = sinon.spy();
      pool1 = registry.createPool();
      registry.addEventListener(ResourcePoolRegistry.Events.RESOURCE_POOL_REMOVED, listener);
    });

    describe('When removing pool by instance', function() {
      beforeEach(function() {
        registry.remove(pool1);
      });
      it('Removed ResourcePool should not be available from registry', function() {
        expect(registry.isRegistered(pool1)).to.be.false;
        expect(registry.get(pool1)).to.be.null;
      });
      it('should fire "' + ResourcePoolRegistry.Events.RESOURCE_POOL_REMOVED + '" event', function() {
        expect(listener).to.be.calledOnce;
      });
      it('should fire event with pool stored as data', function() {
        expect(listener.getCall(0).args[0].data).to.be.equal(pool1);
      });
    });

    describe('When removing pool by ID', function() {
      beforeEach(function() {
        registry.remove(pool1.id);
      });
      it('Removed ResourcePool should not be available from registry', function() {
        expect(registry.isRegistered(pool1)).to.be.false;
        expect(registry.get(pool1)).to.be.null;
      });
      it('should fire "' + ResourcePoolRegistry.Events.RESOURCE_POOL_REMOVED + '" event', function() {
        expect(listener).to.be.calledOnce;
      });
      it('should fire event with pool stored as data', function() {
        expect(listener.getCall(0).args[0].data).to.be.equal(pool1);
      });
    });
  });

  describe('create()', function() {
    it('should return new instance of ResourcePoolRegistry', function() {
      expect(ResourcePoolRegistry.create()).to.be.an.instanceof(ResourcePoolRegistry);
    });
  });

  describe('ResourcePoolRegistry.defaultResourcePool', function() {
    it('should be an instance of ResourcePool', function() {
      expect(ResourcePoolRegistry.defaultResourcePool).to.be.an.instanceof(ResourcePool);
    });
    it('should throw error of destroy() attempt', function() {
      expect(function() {
        ResourcePoolRegistry.defaultResourcePool.destroy();
      }).to.throw(Error);
    });
  });

});
