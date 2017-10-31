import RequestFactory, { createRequestFactory } from './RequestFactory';
import RequestTargetDecorator, { createRequestTargetDecorator } from './RequestTargetDecorator';
import RequestTarget, { createRequestTarget } from './RequestTarget';

describe('RequestFactory', () => {
  let sandbox,
    resource,
    factory,
    decorator,
    handlers;
  beforeEach(() => {
    handlers = {
      available: true,
    };
    sandbox = sinon.sandbox.create();
    decorator = {
      apply: sinon.spy(),
    };
    resource = {};
    sandbox.stub(RequestTarget, 'create').returns(resource);
    sandbox.stub(RequestTargetDecorator, 'create').returns(decorator);
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('When no cache implementation provided', () => {
    beforeEach(() => {
      factory = createRequestFactory(handlers);
    });
    it('cache should be null', () => {
      expect(factory.cache).to.be.null;
    });

    describe('create()', () => {
      let result;
      beforeEach(() => {
        result = factory.create(Promise.reject());
      });

      it('should create RequestTarget', () => {
        expect(RequestTarget.create).to.be.calledOnce;
        expect(result).to.be.equal(resource);
      });

      it('should pass promise and handlers to request', () => {
        const args = RequestTarget.create.getCall(0).args;
        expect(args[0]).to.be.an.instanceof(Promise);
        expect(args[1]).to.be.equal(handlers);
      });

      it('should call decorator', () => {
        expect(decorator.apply).to.be.calledOnce;
        expect(decorator.apply.getCall(0).args[0]).to.be.equal(result);
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
        get: sinon.spy(() => cachedResource),
        set: sinon.spy(() => cachedResource),
      };
      factory = createRequestFactory(handlers, cache);
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
        sinon.stub(factory, 'create').returns(resource);
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
