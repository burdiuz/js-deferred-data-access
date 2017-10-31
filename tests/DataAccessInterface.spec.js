/**
 * Created by Oleg Galaburda on 29.03.16.
 */
/*
describe('DataAccessInterface', () => {
  let sandbox;
  let handlers,
    proxyFactory,
    factory,
    pool,
    poolRegistry,
    converter;
  let customHandlers;
  let instance;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    handlers = {
      setHandlers: sandbox.spy(),
      proxyEnabled: false,
    };
    proxyFactory = {};
    factory = {};
    pool = {
      removeEventListener: sandbox.spy(),
      addEventListener: sandbox.spy(),
    };
    poolRegistry = {
      register: sandbox.spy(),
      createPool: sandbox.spy(() => pool),
    };
    converter = {};
    sandbox.stub(RequestHandlers, 'create').returns(handlers);
    sandbox.stub(RequestProxyFactory, 'create').returns(proxyFactory);
    sandbox.stub(RequestFactory, 'create').returns(factory);
    sandbox.stub(ResourcePoolRegistry, 'create').returns(poolRegistry);
    // ResourcePoolRegistry.defaultResourcePool
    sandbox.stub(ResourceConverter, 'create').returns(converter);
    customHandlers = {};
  });
  afterEach(() => {
    sandbox.restore();
  });
  describe('When created with handlers only', () => {
    beforeEach(() => {
      sandbox.spy(ResourcePoolRegistry.defaultResourcePool, 'addEventListener');
      handlers.proxyEnabled = false;
      instance = new DataAccessInterface(customHandlers);
    });
    it('should have members exposed to public', () => {
      expect(instance.poolRegistry).to.be.equal(poolRegistry);
      expect(instance.pool).to.be.equal(ResourcePoolRegistry.defaultResourcePool);
      expect(instance.resourceConverter).to.be.equal(converter);
      expect(instance.factory).to.be.equal(factory);
    });
    it('should create RequestHandlers', () => {
      expect(RequestHandlers.create).to.be.calledOnce;
      expect(RequestHandlers.create).to.be.calledWith(false);
    });
    it('should create RequestFactory', () => {
      expect(RequestFactory.create).to.be.calledOnce;
      expect(RequestFactory.create).to.be.calledWith(handlers);
      expect(RequestProxyFactory.create).to.not.be.called;
    });
    it('should create ResourcePoolRegistry', () => {
      expect(ResourcePoolRegistry.create).to.be.calledOnce;
    });
    it('should create ResourceConverter', () => {
      expect(ResourceConverter.create).to.be.calledOnce;
      expect(ResourceConverter.create).to.be.calledWith(factory, poolRegistry, ResourcePoolRegistry.defaultResourcePool, handlers);
    });
    it('should apply custom handlers', () => {
      expect(handlers.setHandlers).to.be.calledOnce;
      expect(handlers.setHandlers).to.be.calledWith(customHandlers);
    });
    it('should add listener to pool destroy event', () => {
      expect(ResourcePoolRegistry.defaultResourcePool.addEventListener).to.be.calledOnce;
      expect(ResourcePoolRegistry.defaultResourcePool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, sinon.match.func);
    });
    it('should have proxyEnabled = false', () => {
      expect(instance.proxyEnabled).to.be.false;
    });
  });
  describe('When created with proxyEnabled', () => {
    beforeEach(() => {
      handlers.proxyEnabled = true;
      instance = new DataAccessInterface(customHandlers, true);
    });
    it('should have members exposed to public', () => {
      expect(instance.factory).to.be.equal(proxyFactory);
    });
    it('should create RequestProxyFactory', () => {
      expect(RequestProxyFactory.create).to.be.calledOnce;
      expect(RequestProxyFactory.create).to.be.calledWith(handlers);
      expect(RequestFactory.create).to.not.be.called;
    });
    it('should create RequestHandlers', () => {
      expect(RequestHandlers.create).to.be.calledOnce;
      expect(RequestHandlers.create).to.be.calledWith(true);
    });
    it('should have proxyEnabled = true', () => {
      expect(instance.proxyEnabled).to.be.true;
    });
  });
  describe('When created with poolRegistry', () => {
    let registry;
    beforeEach(() => {
      registry = {
        register: sandbox.spy(),
        createPool: sandbox.spy(() => pool),
      };
      instance = new DataAccessInterface(customHandlers, false, registry);
    });
    it('should have members exposed to public', () => {
      expect(instance.poolRegistry).to.be.equal(registry);
    });
    it('should not create ResourcePoolRegistry', () => {
      expect(ResourcePoolRegistry.create).to.not.be.called;
    });
  });
  describe('When created with pool === null', () => {
    beforeEach(() => {
      instance = new DataAccessInterface(customHandlers, false, null, null);
    });
    it('should have members exposed to public', () => {
      expect(instance.pool).to.be.equal(pool);
    });
    it('should create ResourcePoolRegistry', () => {
      expect(ResourcePoolRegistry.create).to.be.calledOnce;
    });
    it('should create new ResourcePool', () => {
      expect(poolRegistry.createPool).to.be.calledOnce;
    });
    it('should subscribe to pool events', () => {
      expect(pool.addEventListener).to.be.calledOnce;
      expect(pool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, sinon.match.func);
    });
  });
  describe('When created with pool', () => {
    let myPool;
    beforeEach(() => {
      myPool = {
        removeEventListener: sandbox.spy(),
        addEventListener: sandbox.spy(),
      };
      instance = new DataAccessInterface(customHandlers, false, null, myPool);
    });
    it('should have members exposed to public', () => {
      expect(instance.pool).to.be.equal(myPool);
    });
    it('should create ResourcePoolRegistry', () => {
      expect(ResourcePoolRegistry.create).to.be.calledOnce;
    });
    it('should registger pool', () => {
      expect(poolRegistry.register).to.be.calledOnce;
      expect(poolRegistry.register).to.be.calledWith(myPool);
    });
    it('should subscribe to pool events', () => {
      expect(myPool.addEventListener).to.be.calledOnce;
      expect(myPool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, sinon.match.func);
    });
  });
  describe('When created with poolRegistry and pool', () => {
    let myPool;
    let registry;
    beforeEach(() => {
      registry = {
        register: sandbox.spy(),
        createPool: sandbox.spy(() => pool),
      };
      myPool = {
        removeEventListener: sandbox.spy(),
        addEventListener: sandbox.spy(),
      };
      instance = new DataAccessInterface(customHandlers, false, registry, myPool);
    });
    it('should have members exposed to public', () => {
      expect(instance.poolRegistry).to.be.equal(registry);
      expect(instance.pool).to.be.equal(myPool);
    });
    it('should register pool in registry', () => {
      expect(registry.register).to.be.calledOnce;
      expect(registry.register).to.be.calledWith(myPool);
    });
    it('should subscribe to pool events', () => {
      expect(myPool.addEventListener).to.be.calledOnce;
      expect(myPool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, sinon.match.func);
    });

    describe('When pool destroyed', () => {
      let handler;
      beforeEach(() => {
        handler = myPool.addEventListener.getCall(0).args[1];
        handler({ type: ResourcePool.Events.POOL_DESTROYED });
      });
      it('should removeEventListener from destroyed pool', () => {
        expect(myPool.removeEventListener).to.be.calledOnce;
        expect(myPool.removeEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, handler);
      });
      it('should create new pool', () => {
        expect(registry.createPool).to.be.calledOnce;
      });
      it('should subscribe to new pool', () => {
        expect(pool.addEventListener).to.be.calledOnce;
        expect(pool.addEventListener).to.be.calledWith(ResourcePool.Events.POOL_DESTROYED, handler);
      });
      it('should have members exposed to public', () => {
        expect(instance.pool).to.be.equal(pool);
      });
    });
  });
  describe('When created with cache implementation', () => {
    let cache;
    beforeEach(() => {
      cache = {};
      instance = new DataAccessInterface(customHandlers, false, null, undefined, cache);
    });
    it('should be passed to factory', () => {
      expect(RequestFactory.create).to.be.calledOnce;
      expect(RequestFactory.create).to.be.calledWith(handlers, cache);
    });
  });
  describe('When created with proxy and cache implementation', () => {
    let cache;
    beforeEach(() => {
      cache = {};
      instance = new DataAccessInterface(customHandlers, true, null, undefined, cache);
    });
    it('should be passed to factory', () => {
      expect(RequestProxyFactory.create).to.be.calledOnce;
      expect(RequestProxyFactory.create).to.be.calledWith(handlers, cache);
    });
  });

  describe('When proxies are enabled but not available', () => {
    let _Proxy;
    beforeEach(() => {
      _Proxy = Proxy;
      Proxy = null;
    });
    afterEach(() => {
      Proxy = _Proxy;
    });
    it('should throw error', () => {
      expect(() => {
        new DataAccessInterface(customHandlers, true);
      }).to.throw(Error);
    });
  });
  describe('create()', () => {
    let cache;
    let myPool;
    let registry;
    beforeEach(() => {
      registry = {
        register: sandbox.spy(),
        createPool: sandbox.spy(() => pool),
      };
      myPool = {
        removeEventListener: sandbox.spy(),
        addEventListener: sandbox.spy(),
      };
      cache = {};
      instance = DataAccessInterface.create(customHandlers, true, registry, myPool, cache);
    });
    it('should have members exposed to public', () => {
      expect(instance.poolRegistry).to.be.equal(registry);
      expect(instance.pool).to.be.equal(myPool);
      expect(RequestProxyFactory.create).to.be.calledWith(handlers, cache);
    });
    it('should apply custom handlers', () => {
      expect(handlers.setHandlers).to.be.calledOnce;
      expect(handlers.setHandlers).to.be.calledWith(customHandlers);
    });
  });
  describe('parse()', () => {
    let target,
      result,
      value;
    beforeEach(() => {
      target = {};
      value = {};
      converter.parse = sandbox.spy(() => value);
      instance = new DataAccessInterface(customHandlers);
      result = instance.parse(target);
    });
    it('should call converter', () => {
      expect(converter.parse).to.be.calledOnce;
      expect(converter.parse).to.be.calledWith(target);
      expect(value).to.be.equal(result);
    });
  });
  describe('toJSON()', () => {
    let target,
      result,
      value;
    beforeEach(() => {
      target = {};
      value = {};
      converter.toJSON = sandbox.spy(() => value);
      instance = new DataAccessInterface(customHandlers);
      result = instance.toJSON(target);
    });
    it('should call converter', () => {
      expect(converter.toJSON).to.be.calledOnce;
      expect(converter.toJSON).to.be.calledWith(target);
      expect(value).to.be.equal(result);
    });
  });
});
*/
