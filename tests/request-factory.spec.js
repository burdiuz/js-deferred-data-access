describe('RequestFactory', function() {
  var sandbox, resource, factory, decorator, handlers;
  beforeEach(function() {
    handlers = {
      available: true
    };
    sandbox = sinon.sandbox.create();
    decorator = {
      apply: sinon.spy()
    };
    resource = {};
    sandbox.stub(RequestTarget, 'create').returns(resource);
    sandbox.stub(RequestTargetDecorator, 'create').returns(decorator);
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe('When no cache implementation provided', function() {
    beforeEach(function() {
      factory = RequestFactory.create(handlers);
    });
    it('cache should be null', function() {
      expect(factory.cache).to.be.null;
    });

    describe('create()', function() {
      var result;
      beforeEach(function() {
        result = factory.create(Promise.reject());
      });

      it('should create RequestTarget', function() {
        expect(RequestTarget.create).to.be.calledOnce;
        expect(result).to.be.equal(resource);
      });

      it('should pass promise and handlers to request', function() {
        var args = RequestTarget.create.getCall(0).args;
        expect(args[0]).to.be.an.instanceof(Promise);
        expect(args[1]).to.be.equal(handlers);
      });

      it('should call decorator', function() {
        expect(decorator.apply).to.be.calledOnce;
        expect(decorator.apply.getCall(0).args[0]).to.be.equal(result);
      });
    });
    it('getCached() should return null', function() {
      expect(factory.getCached('property', {})).to.be.null;
    });
    it('createCached() should return null', function() {
      expect(factory.createCached(Promise.reject(), 'property', {})).to.be.null;
    });
  });

  describe('When cache implementation provided', function() {
    var cache, pack, cachedResource;
    var result;
    beforeEach(function() {
      cachedResource = {};
      pack = {
        type: 'type',
        cmd: 'command',
        value: 'vaalue',
        target: '1111'
      };
      cache = {
        get: sinon.spy(function() {
          return cachedResource;
        }),
        set: sinon.spy(function() {
          return cachedResource;
        })
      };
      factory = RequestFactory.create(handlers, cache);
    });
    describe('getCached()', function() {
      beforeEach(function() {
        result = factory.getCached('property', pack);
      });
      it('should request cached instance', function() {
        expect(cache.get).to.be.calledOnce;
        expect(cache.get).to.be.calledWith('property', pack);
      });
      it('should return cached instance', function() {
        expect(result).to.be.equal(cachedResource);
      });
    });
    describe('createCached()', function() {
      var resource;
      beforeEach(function() {
        resource = {};
        sinon.stub(factory, 'create').returns(resource);
        result = factory.createCached(Promise.reject(), 'property', pack);
      });
      it('should create new resource', function() {
        expect(factory.create).to.be.calledOnce;
        expect(factory.create).to.be.calledWith(sinon.match.instanceOf(Promise));
        expect(factory.create).to.be.calledBefore(cache.set);
      });
      it('should cache created resource', function() {
        expect(cache.set).to.be.calledOnce;
        expect(cache.set).to.be.calledWith('property', pack, resource);
      });
      it('should return cached instance', function() {
        expect(result).to.be.equal(resource);
      });
    });
  });

});
