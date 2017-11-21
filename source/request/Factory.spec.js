const requestFactoryInjector = require('inject-loader!./Factory');

describe('RequestFactory', () => {
  let sandbox;
  let resource;
  let factory;
  let decorator;
  let handlers;
  let module;
  let requestTargetModule;
  let requestTargetDecoratorModule;

  beforeEach(() => {
    handlers = {
      available: true,
    };
    sandbox = sinon.sandbox.create();
    decorator = {
      apply: sandbox.spy(),
    };
    resource = {};
  });

  // inject module with mocks
  beforeEach(() => {
    requestTargetModule = {
      createRequestTarget: sandbox.spy(() => resource),
    };

    requestTargetDecoratorModule = {
      createDecorator: sandbox.spy(() => decorator),
    };

    module = requestFactoryInjector({
      './Target': requestTargetModule,
      './Decorator': requestTargetDecoratorModule,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('When noInit passed', () => {
    beforeEach(() => {
      factory = new module.default(module.NO_INIT);
    });

    it('should not create decorator', () => {
      expect(factory.decorator).to.be.undefined;
    });
  });

  describe('When no cache implementation provided', () => {
    beforeEach(() => {
      factory = module.createRequestFactory(handlers);
    });

    it('cache should be null', () => {
      expect(factory.cache).to.be.null;
    });

    describe('create()', () => {
      let result;

      describe('When handlers are available', () => {
        beforeEach(() => {
          result = factory.create(Promise.reject());
        });

        it('should create Target', () => {
          expect(requestTargetModule.createRequestTarget).to.be.calledOnce;
          expect(result).to.be.equal(resource);
        });

        it('should pass promise and handlers to request', () => {
          const { args } = requestTargetModule.createRequestTarget.getCall(0);
          expect(args[0]).to.be.an.instanceof(Promise);
          expect(args[1]).to.be.equal(handlers);
        });

        it('should call decorator', () => {
          expect(decorator.apply).to.be.calledOnce;
          expect(decorator.apply.getCall(0).args[0]).to.be.equal(result);
        });
      });

      describe('When handlers are not available', () => {
        beforeEach(() => {
          handlers.available = false;
          result = factory.create(Promise.reject());
        });

        it('should create Target', () => {
          expect(requestTargetModule.createRequestTarget).to.be.calledOnce;
          expect(result).to.be.equal(resource);
        });

        it('should not call decorator', () => {
          expect(decorator.apply).not.to.be.called;
        });
      });
    });

    it('getCached() should return null', () => {
      expect(factory.getCached('property', {})).to.be.null;
    });

    it('createCached() should return null', () => {
      expect(factory.createCached(Promise.reject(), 'property', {})).to.be.null;
    });
  });

  describe('When cache implementation provided', () => {
    let cache;
    let pack;
    let cachedResource;
    let result;

    beforeEach(() => {
      cachedResource = {};
      pack = {
        type: 'type',
        cmd: 'command',
        value: 'vaalue',
        target: '1111',
      };
      cache = {
        get: sandbox.spy(() => cachedResource),
        set: sandbox.spy(() => cachedResource),
      };
      factory = module.createRequestFactory(handlers, cache);
    });
    describe('getCached()', () => {
      beforeEach(() => {
        result = factory.getCached('property', pack);
      });

      it('should request cached instance', () => {
        expect(cache.get).to.be.calledOnce;
        expect(cache.get).to.be.calledWith('property', pack);
      });

      it('should return cached instance', () => {
        expect(result).to.be.equal(cachedResource);
      });
    });
    describe('createCached()', () => {
      let resource;

      beforeEach(() => {
        resource = {};
        sandbox.stub(factory, 'create').returns(resource);
        result = factory.createCached(Promise.reject(), 'property', pack);
      });

      it('should create new resource', () => {
        expect(factory.create).to.be.calledOnce;
        expect(factory.create).to.be.calledWith(sinon.match.instanceOf(Promise));
        expect(factory.create).to.be.calledBefore(cache.set);
      });

      it('should cache created resource', () => {
        expect(cache.set).to.be.calledOnce;
        expect(cache.set).to.be.calledWith('property', pack, resource);
      });

      it('should return cached instance', () => {
        expect(result).to.be.equal(resource);
      });
    });
  });

});
