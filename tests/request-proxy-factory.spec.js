/**
 * Created by Oleg Galaburda on 29.03.16.
 */
describe('RequestProxyFactory', function() {
  var sandbox;
  var resource, baseFactory, decorator, handlers, cache;
  var factory;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });
  afterEach(function() {
    sandbox.restore();
  });
  beforeEach(function() {
    resource = {
      then:sinon.spy(),
      catch:sinon.spy()
    };
    resource[ProxyCommands.fields.get] = sandbox.spy();
    resource[ProxyCommands.fields.set] = sandbox.spy();
    resource[ProxyCommands.fields.apply] = sandbox.spy();
    resource[ProxyCommands.fields.deleteProperty] = sandbox.spy();
    handlers = {
      available: true
    };
    baseFactory = {
      getCached: sandbox.spy(function() {
        return resource;
      }),
      createCached: sandbox.spy(function() {
        return resource;
      }),
      create: sandbox.spy(function() {
        return resource;
      })
    };
    decorator = {
      setFactory: sandbox.spy()
    };
    baseFactory[FACTORY_DECORATOR_FIELD] = decorator;
    sandbox.stub(RequestFactory, 'create').returns(baseFactory);
    factory = new RequestProxyFactory(handlers, cache);
  });
  it('should create factory', function() {
    expect(RequestFactory.create).to.be.calledOnce;
    expect(RequestFactory.create).to.be.calledWith(handlers, cache);
  });
  it('should reset decorator factory link', function() {
    expect(decorator.setFactory).to.be.calledOnce;
    expect(decorator.setFactory).to.be.calledWith(factory);
  });
  describe('create()', function() {
    var result;
    describe('When handlers are available', function() {
      beforeEach(function() {
        handlers.available = true;
        result = factory.create(Promise.reject());
      });
      it('should return wrapped resource', function() {
        expect(result).to.be.a('function');
      });
    });
    describe('When handlers are not available', function() {
      beforeEach(function() {
        handlers.available = false;
        result = factory.create(Promise.reject());
      });
      it('should return normal resource', function() {
        expect(result).to.be.equal(resource);
      });
    });
  });
  describe('getCached()', function() {
    var result, pack;
    beforeEach(function() {
      pack = {
        type: 'type',
        cmd: 'command',
        value: 'vaalue',
        target: '1111'
      };
      result = factory.getCached('property', pack);
    });
    it('should request base factory', function() {
      expect(baseFactory.getCached).to.be.calledOnce;
      expect(baseFactory.getCached).to.be.calledWith('property', pack);
    });
  });
  describe('createCached()', function() {
    var result, pack;
    beforeEach(function() {
      pack = {
        type: 'type',
        cmd: 'command',
        value: 'vaalue',
        target: '1111'
      };
    });
    describe('When handlers are available', function() {
      beforeEach(function() {
        handlers.available = true;
        result = factory.createCached(Promise.reject(), 'property', pack);
      });
      it('should return wrapped resource', function() {
        expect(result).to.be.a('function');
      });
      it('should request base factory', function() {
        expect(baseFactory.createCached).to.be.calledOnce;
        expect(baseFactory.createCached).to.be.calledWith(sinon.match.instanceOf(Promise), 'property', pack);
      });
    });
    describe('When handlers are not available', function() {
      beforeEach(function() {
        handlers.available = false;
        result = factory.createCached(Promise.reject(), 'property', pack);
      });
      it('should return normal resource', function() {
        expect(result).to.be.equal(resource);
      });
      it('should request base factory', function() {
        expect(baseFactory.createCached).to.be.calledOnce;
        expect(baseFactory.createCached).to.be.calledWith(sinon.match.instanceOf(Promise), 'property', pack);
      });
    });
  });
  describe('Proxy wrapper', function() {
    var result;
    beforeEach(function() {
      handlers.available = true;
      result = factory.create(Promise.reject());
    });
    describe('get', function() {
      var value;
      beforeEach(function() {
        value = result.property;
      });
      it('should call proxy handler', function() {
        expect(resource[ProxyCommands.fields.get]).to.be.calledOnce;
        expect(resource[ProxyCommands.fields.get]).to.be.calledWith('property');
      });
      describe('When Symbol used', function() {
        var name, value;
        beforeEach(function() {
          name = Symbol('some property');
          resource[ProxyCommands.fields.get].reset();
          value = result[name];
        });
        it('should not call proxy handler', function() {
          expect(resource[ProxyCommands.fields.get]).to.not.be.called;
        });
        it('should apply value directly', function() {
          expect(value).to.be.undefined;
        });
      });
      describe('When existent property used', function() {
        var value;
        beforeEach(function() {
          resource[ProxyCommands.fields.get].reset();
          value = result.then;
        });
        it('should not call proxy handler', function() {
          expect(resource[ProxyCommands.fields.get]).to.not.be.called;
        });
        it('should apply value directly', function() {
          expect(value).to.be.equal(resource.then);
        });
      });
    });
    describe('set', function() {
      beforeEach(function() {
        result.property = 'value';
      });
      it('should call proxy handler', function() {
        expect(resource[ProxyCommands.fields.set]).to.be.calledOnce;
        expect(resource[ProxyCommands.fields.set]).to.be.calledWith('property', 'value');
      });
      describe('When Symbol used', function() {
        var name;
        beforeEach(function() {
          name = Symbol('some property');
          resource[ProxyCommands.fields.set].reset();
          result[name] = 'VALUE';
        });
        it('should not call proxy handler', function() {
          expect(resource[ProxyCommands.fields.set]).to.not.be.called;
        });
        it('should apply value directly', function() {
          expect(resource[name]).to.be.equal('VALUE');
        });
      });
      describe('When existent property used', function() {
        beforeEach(function() {
          resource[ProxyCommands.fields.set].reset();
          result.then = 'VALUE';
        });
        it('should not call proxy handler', function() {
          expect(resource[ProxyCommands.fields.set]).to.not.be.called;
        });
        it('should apply value directly', function() {
          expect(resource.then).to.be.equal('VALUE');
        });
      });
    });
    describe('apply', function() {
      var value;
      beforeEach(function() {
        value = result('command', 'value');
      });
      it('should call proxy handler', function() {
        expect(resource[ProxyCommands.fields.apply]).to.be.calledOnce;
        expect(resource[ProxyCommands.fields.apply]).to.be.calledWith(null, ['command', 'value']);
      });
    });
    describe('has', function() {
      it('should check field availability on target', function() {
        expect('item' in result).to.be.false;
        expect('then' in result).to.be.true;
      });
    });
    describe('deleteProperty', function() {
      var value;
      beforeEach(function() {
        value = delete result.property;
      });
      it('should call proxy handler', function() {
        expect(resource[ProxyCommands.fields.deleteProperty]).to.be.calledOnce;
        expect(resource[ProxyCommands.fields.deleteProperty]).to.be.calledWith('property');
      });
      it('should result with true', function() {
        expect(value).to.be.true;
      });
      describe('When handler is null', function() {
        var value;
        beforeEach(function() {
          delete resource[ProxyCommands.fields.deleteProperty];
          value = delete result.property;
        });
        it('should result with false', function() {
          expect(value).to.be.false;
        });
      });
    });
  });
});
