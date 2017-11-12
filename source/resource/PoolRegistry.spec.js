import ResourcePool, { createResourcePool } from './ResourcePool';
import PoolRegistry, {
  createPoolRegistry,
  PoolRegistryEvents,
} from './PoolRegistry';

describe('PoolRegistry', () => {
  let registry;
  let pool;

  beforeEach(() => {
    registry = new PoolRegistry();
    pool = registry.createPool();
  });

  describe('createPool()', () => {
    let pool1;
    let listener;

    beforeEach(() => {
      listener = sinon.spy();
      registry.addEventListener(PoolRegistryEvents.RESOURCE_POOL_CREATED, listener);
      pool1 = registry.createPool();
    });

    it('should return new ResourcePool instance', () => {
      expect(pool1).to.be.an.instanceof(ResourcePool);
      expect(pool1).to.not.be.equal(pool);
    });

    it(`should fire "${PoolRegistryEvents.RESOURCE_POOL_CREATED}" event`, () => {
      expect(listener).to.be.calledOnce;
    });

    it('should fire event with pool stored as data', () => {
      expect(listener.getCall(0).args[0].data).to.be.equal(pool1);
    });

    it('should register new ResourcePool', () => {
      expect(registry.isRegistered(pool)).to.be.true;
      expect(registry.isRegistered(pool1)).to.be.true;
    });
  });

  describe('When registering pool', () => {
    let pool1;
    let listener;

    beforeEach(() => {
      listener = sinon.spy();
      pool1 = createResourcePool();
      registry.addEventListener(PoolRegistryEvents.RESOURCE_POOL_REGISTERED, listener);
      registry.register(pool1);
    });

    it('ResourcePool should be available from registry', () => {
      expect(registry.isRegistered(pool1)).to.be.true;
      expect(registry.get(pool1.id)).to.be.equal(pool1);
    });

    it(`should fire "${PoolRegistryEvents.RESOURCE_POOL_REGISTERED}" event`, () => {
      expect(listener).to.be.calledOnce;
    });

    it('should fire event with pool stored as data', () => {
      expect(listener.getCall(0).args[0].data).to.be.equal(pool1);
    });

    describe('When registering twice', () => {
      beforeEach(() => {
        registry.register(pool1);
      });

      it('ResourcePool registration should remain', () => {
        expect(registry.isRegistered(pool1)).to.be.true;
      });

      it('should not fire event second time', () => {
        expect(listener).to.be.calledOnce;
      });
    });

  });

  describe('When accessing pool', () => {
    it('should be accessible by ID', () => {
      expect(registry.get(pool.id)).to.be.equal(pool);
    });

    describe('When accessing non-existent pool', () => {
      it('should return null', () => {
        expect(registry.get('111111')).to.be.null;
      });
    });

  });

  describe('When check if pool exists', () => {
    it('should be available by ID', () => {
      expect(registry.isRegistered(pool.id)).to.be.true;
    });

    it('should be available by instance', () => {
      expect(registry.isRegistered(pool)).to.be.true;
    });

    it('should be false for non-existent pool', () => {
      expect(registry.isRegistered('1010101')).to.be.false;
    });
  });

  describe('When destroying pool', () => {
    beforeEach(() => {
      pool.destroy();
    });

    it('should listen to destroy event and remove pool from registry', () => {
      expect(registry.isRegistered(pool)).to.be.false;
    });
  });

  describe('When removing pool', () => {
    let pool1;
    let listener;

    beforeEach(() => {
      listener = sinon.spy();
      pool1 = registry.createPool();
      registry.addEventListener(PoolRegistryEvents.RESOURCE_POOL_REMOVED, listener);
    });

    describe('When removing pool by instance', () => {
      beforeEach(() => {
        registry.remove(pool1);
      });

      it('Removed ResourcePool should not be available from registry', () => {
        expect(registry.isRegistered(pool1)).to.be.false;
        expect(registry.get(pool1)).to.be.null;
      });

      it(`should fire "${PoolRegistryEvents.RESOURCE_POOL_REMOVED}" event`, () => {
        expect(listener).to.be.calledOnce;
      });

      it('should fire event with pool stored as data', () => {
        expect(listener.getCall(0).args[0].data).to.be.equal(pool1);
      });
    });

    describe('When removing pool by ID', () => {
      beforeEach(() => {
        registry.remove(pool1.id);
      });

      it('Removed ResourcePool should not be available from registry', () => {
        expect(registry.isRegistered(pool1)).to.be.false;
        expect(registry.get(pool1)).to.be.null;
      });

      it(`should fire "${PoolRegistryEvents.RESOURCE_POOL_REMOVED}" event`, () => {
        expect(listener).to.be.calledOnce;
      });

      it('should fire event with pool stored as data', () => {
        expect(listener.getCall(0).args[0].data).to.be.equal(pool1);
      });
    });
  });

  describe('createPoolRegistry()', () => {
    it('should return new instance of PoolRegistry', () => {
      expect(createPoolRegistry()).to.be.an.instanceof(PoolRegistry);
    });
  });
});
