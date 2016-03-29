/**
 * Created by Oleg Galaburda on 29.03.16.
 */
describe('DataAccessInterface', function() {
  var sandbox;
  var handlers, proxyFactory, factory, pool, poolRegistry, converter;
  var customHandlers;
  var instance;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    handlers = {
      setHandlers: sandbox.spy(),
      proxyEnabled: false
    };
    proxyFactory = {};
    factory = {};
    pool = {
      removeEventListener: sandbox.spy(),
      addEventListener: sandbox.spy()
    };
    poolRegistry = {
      register: sandbox.spy(),
      createPool: sandbox.spy(function() {
        return pool;
      })
    };
    converter = {};
    sandbox.stub(RequestHandlers, 'create').returns(handlers);
    sandbox.stub(RequestProxyFactory, 'create').returns(proxyFactory);
    sandbox.stub(RequestFactory, 'create').returns(factory);
    sandbox.stub(ResourcePoolRegistry, 'create').returns(poolRegistry);
    //ResourcePoolRegistry.defaultResourcePool
    sandbox.stub(ResourceConverter, 'create').returns(converter);
    customHandlers = {};
  });
  afterEach(function() {
    sandbox.restore();
  });
  describe('When created with handlers only', function() {
    beforeEach(function() {
      sandbox.spy(ResourcePoolRegistry.defaultResourcePool, 'addEventListener');
      handlers.proxyEnabled = false;
      instance = new DataAccessInterface(customHandlers);
    });
    it('should have members exposed to public', function() {
      expect(instance.poolRegistry).to.be.equal(poolRegistry);
      expect(instance.pool).to.be.equal(ResourcePoolRegistry.defaultResourcePool);
      expect(instance.resourceConverter).to.be.equal(converter);
      expect(instance.factory).to.be.equal(factory);
    });
    it('should create RequestHandlers', function() {
      expect(RequestHandlers.create).to.be.calledOnce;
      expect(RequestHandlers.create).to.be.calledWith(false);
    });
    it('should create RequestFactory', function() {
      expect(RequestFactory.create).to.be.calledOnce;
      expect(RequestFactory.create).to.be.calledWith(handlers);
      expect(RequestProxyFactory.create).to.not.be.called;
    });
    it('should create ResourcePoolRegistry', function() {
      expect(ResourcePoolRegistry.create).to.be.calledOnce;
    });
    it('should create ResourceConverter', function() {
      expect(ResourceConverter.create).to.be.calledOnce;
      expect(ResourceConverter.create).to.be.calledWith(factory, poolRegistry, ResourcePoolRegistry.defaultResourcePool, handlers);
    });
    it('should apply custom handlers', function() {
      expect(handlers.setHandlers).to.be.calledOnce;
      expect(handlers.setHandlers).to.be.calledWith(customHandlers);
    });
    it('should add listener to pool destroy event', function() {
      expect(ResourcePoolRegistry.defaultResourcePool.addEventListener).to.be.calledOnce;
      expect(ResourcePoolRegistry.defaultResourcePool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, sinon.match.func);
    });
    it('should have proxyEnabled = false', function() {
      expect(instance.proxyEnabled).to.be.false;
    });
  });
  describe('When created with proxyEnabled', function() {
    beforeEach(function() {
      handlers.proxyEnabled = true;
      instance = new DataAccessInterface(customHandlers, true);
    });
    it('should have members exposed to public', function() {
      expect(instance.factory).to.be.equal(proxyFactory);
    });
    it('should create RequestProxyFactory', function() {
      expect(RequestProxyFactory.create).to.be.calledOnce;
      expect(RequestProxyFactory.create).to.be.calledWith(handlers);
      expect(RequestFactory.create).to.not.be.called;
    });
    it('should create RequestHandlers', function() {
      expect(RequestHandlers.create).to.be.calledOnce;
      expect(RequestHandlers.create).to.be.calledWith(true);
    });
    it('should have proxyEnabled = true', function() {
      expect(instance.proxyEnabled).to.be.true;
    });
  });
  describe('When created with poolRegistry', function() {
    var registry;
    beforeEach(function() {
      registry = {
        register: sandbox.spy(),
        createPool: sandbox.spy(function() {
          return pool;
        })
      };
      instance = new DataAccessInterface(customHandlers, false, registry);
    });
    it('should have members exposed to public', function() {
      expect(instance.poolRegistry).to.be.equal(registry);
    });
    it('should not create ResourcePoolRegistry', function() {
      expect(ResourcePoolRegistry.create).to.not.be.called;
    });
  });
  describe('When created with pool === null', function() {
    beforeEach(function() {
      instance = new DataAccessInterface(customHandlers, false, null, null);
    });
    it('should have members exposed to public', function() {
      expect(instance.pool).to.be.equal(pool);
    });
    it('should create ResourcePoolRegistry', function() {
      expect(ResourcePoolRegistry.create).to.be.calledOnce;
    });
    it('should create new ResourcePool', function() {
      expect(poolRegistry.createPool).to.be.calledOnce;
    });
    it('should subscribe to pool events', function() {
      expect(pool.addEventListener).to.be.calledOnce;
      expect(pool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, sinon.match.func);
    });
  });
  describe('When created with pool', function() {
    var myPool;
    beforeEach(function() {
      myPool = {
        removeEventListener: sandbox.spy(),
        addEventListener: sandbox.spy()
      };
      instance = new DataAccessInterface(customHandlers, false, null, myPool);
    });
    it('should have members exposed to public', function() {
      expect(instance.pool).to.be.equal(myPool);
    });
    it('should create ResourcePoolRegistry', function() {
      expect(ResourcePoolRegistry.create).to.be.calledOnce;
    });
    it('should registger pool', function() {
      expect(poolRegistry.register).to.be.calledOnce;
      expect(poolRegistry.register).to.be.calledWith(myPool);
    });
    it('should subscribe to pool events', function() {
      expect(myPool.addEventListener).to.be.calledOnce;
      expect(myPool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, sinon.match.func);
    });
  });
  describe('When created with poolRegistry and pool', function() {
    var myPool;
    var registry;
    beforeEach(function() {
      registry = {
        register: sandbox.spy(),
        createPool: sandbox.spy(function() {
          return pool;
        })
      };
      myPool = {
        removeEventListener: sandbox.spy(),
        addEventListener: sandbox.spy()
      };
      instance = new DataAccessInterface(customHandlers, false, registry, myPool);
    });
    it('should have members exposed to public', function() {
      expect(instance.poolRegistry).to.be.equal(registry);
      expect(instance.pool).to.be.equal(myPool);
    });
    it('should register pool in registry', function() {
      expect(registry.register).to.be.calledOnce;
      expect(registry.register).to.be.calledWith(myPool);
    });
    it('should subscribe to pool events', function() {
      expect(myPool.addEventListener).to.be.calledOnce;
      expect(myPool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, sinon.match.func);
    });

    describe('When pool destroyed', function() {
      var handler;
      beforeEach(function() {
        handler = myPool.addEventListener.getCall(0).args[1];
        handler({type: ResourcePool.Events.POOL_DESTROYED});
      });
      it('should removeEventListener from destroyed pool', function() {
        expect(myPool.removeEventListener).to.be.calledOnce;
        expect(myPool.removeEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, handler);
      });
      it('should create new pool', function() {
        expect(registry.createPool).to.be.calledOnce;
      });
      it('should subscribe to new pool', function() {
        expect(pool.addEventListener).to.be.calledOnce;
        expect(pool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, handler);
      });
      it('should have members exposed to public', function() {
        expect(instance.pool).to.be.equal(pool);
      });
    });
  });
  describe('When created with cache implementation', function() {
    var cache;
    beforeEach(function() {
      cache = {};
      instance = new DataAccessInterface(customHandlers, false, null, undefined, cache);
    });
    it('should be passed to factory', function() {
      expect(RequestFactory.create).to.be.calledOnce;
      expect(RequestFactory.create).to.be.calledWith(handlers, cache);
    });
  });
  describe('When created with proxy and cache implementation', function() {
    var cache;
    beforeEach(function() {
      cache = {};
      instance = new DataAccessInterface(customHandlers, true, null, undefined, cache);
    });
    it('should be passed to factory', function() {
      expect(RequestProxyFactory.create).to.be.calledOnce;
      expect(RequestProxyFactory.create).to.be.calledWith(handlers, cache);
    });
  });
});
