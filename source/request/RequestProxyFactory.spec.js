/**
 * Created by Oleg Galaburda on 29.03.16.
 */

import { ProxyCommandFields } from '../commands';
import RequestFactory from './RequestFactory';
import RequestProxyFactory from './RequestProxyFactory';

describe('RequestProxyFactory', () => {
  let sandbox;
  let resource,
    baseFactory,
    decorator,
    handlers,
    cache;
  let factory;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });
  beforeEach(() => {
    resource = {
      then: sandbox.spy(),
      catch: sandbox.spy(),
    };
    resource[ProxyCommandFields.get] = sandbox.spy();
    resource[ProxyCommandFields.set] = sandbox.spy();
    resource[ProxyCommandFields.apply] = sandbox.spy();
    resource[ProxyCommandFields.deleteProperty] = sandbox.spy();
    handlers = {
      available: true,
    };
    baseFactory = {
      getCached: sandbox.spy(() => resource),
      createCached: sandbox.spy(() => resource),
      create: sandbox.spy(() => resource),
    };
    decorator = {
      setFactory: sandbox.spy(),
    };
    baseFactory[FACTORY_DECORATOR_FIELD] = decorator;
    sandbox.stub(RequestFactory, 'create').returns(baseFactory);
    factory = new RequestProxyFactory(handlers, cache);
  });
  it('should create factory', () => {
    expect(RequestFactory.create).to.be.calledOnce;
    expect(RequestFactory.create).to.be.calledWith(handlers, cache);
  });
  it('should reset decorator factory link', () => {
    expect(decorator.setFactory).to.be.calledOnce;
    expect(decorator.setFactory).to.be.calledWith(factory);
  });

  describe('create()', () => {
    let result;

    describe('When handlers are available', () => {
      beforeEach(() => {
        handlers.available = true;
        result = factory.create(Promise.reject());
      });
      it('should return wrapped resource', () => {
        expect(result).to.be.a('function');
      });
    });

    describe('When handlers are not available', () => {
      beforeEach(() => {
        handlers.available = false;
        result = factory.create(Promise.reject());
      });
      it('should return normal resource', () => {
        expect(result).to.be.equal(resource);
      });
    });

  });

  describe('getCached()', () => {
    let result,
      pack;
    beforeEach(() => {
      pack = {
        type: 'type',
        cmd: 'command',
        value: 'vaalue',
        target: '1111',
      };
      result = factory.getCached('property', pack);
    });
    it('should request base factory', () => {
      expect(baseFactory.getCached).to.be.calledOnce;
      expect(baseFactory.getCached).to.be.calledWith('property', pack);
    });
  });

  describe('createCached()', () => {
    let result,
      pack;
    beforeEach(() => {
      pack = {
        type: 'type',
        cmd: 'command',
        value: 'vaalue',
        target: '1111',
      };
    });

    describe('When handlers are available', () => {
      beforeEach(() => {
        handlers.available = true;
        result = factory.createCached(Promise.reject(), 'property', pack);
      });
      it('should return wrapped resource', () => {
        expect(result).to.be.a('function');
      });
      it('should request base factory', () => {
        expect(baseFactory.createCached).to.be.calledOnce;
        expect(baseFactory.createCached).to.be.calledWith(
          sinon.match.instanceOf(Promise),
          'property',
          pack,
        );
      });
    });

    describe('When handlers are not available', () => {
      beforeEach(() => {
        handlers.available = false;
        result = factory.createCached(Promise.reject(), 'property', pack);
      });
      it('should return normal resource', () => {
        expect(result).to.be.equal(resource);
      });
      it('should request base factory', () => {
        expect(baseFactory.createCached).to.be.calledOnce;
        expect(baseFactory.createCached).to.be.calledWith(
          sinon.match.instanceOf(Promise),
          'property',
          pack,
        );
      });
    });
  });

  describe('Proxy wrapper', () => {
    let result;
    beforeEach(() => {
      handlers.available = true;
      result = factory.create(Promise.reject());
    });

    describe('get', () => {
      let value;
      beforeEach(() => {
        value = result.property;
      });
      it('should call proxy handler', () => {
        expect(resource[ProxyCommandFields.get]).to.be.calledOnce;
        expect(resource[ProxyCommandFields.get]).to.be.calledWith('property');
      });

      describe('When Symbol used', () => {
        let name,
          value;
        beforeEach(() => {
          name = Symbol('some property');
          resource[ProxyCommandFields.get].reset();
          value = result[name];
        });
        it('should not call proxy handler', () => {
          expect(resource[ProxyCommandFields.get]).to.not.be.called;
        });
        it('should apply value directly', () => {
          expect(value).to.be.undefined;
        });
      });

      describe('When existent property used', () => {
        let value;
        beforeEach(() => {
          resource[ProxyCommandFields.get].reset();
          value = result.then;
        });
        it('should not call proxy handler', () => {
          expect(resource[ProxyCommandFields.get]).to.not.be.called;
        });
        it('should apply value directly', () => {
          expect(value).to.be.equal(resource.then);
        });
      });
    });

    describe('set', () => {
      beforeEach(() => {
        result.property = 'value';
      });
      it('should call proxy handler', () => {
        expect(resource[ProxyCommandFields.set]).to.be.calledOnce;
        expect(resource[ProxyCommandFields.set]).to.be.calledWith('property', 'value');
      });

      describe('When Symbol used', () => {
        let name;
        beforeEach(() => {
          name = Symbol('some property');
          resource[ProxyCommandFields.set].reset();
          result[name] = 'VALUE';
        });
        it('should not call proxy handler', () => {
          expect(resource[ProxyCommandFields.set]).to.not.be.called;
        });
        it('should apply value directly', () => {
          expect(resource[name]).to.be.equal('VALUE');
        });
      });

      describe('When existent property used', () => {
        beforeEach(() => {
          resource[ProxyCommandFields.set].reset();
          result.then = 'VALUE';
        });
        it('should not call proxy handler', () => {
          expect(resource[ProxyCommandFields.set]).to.not.be.called;
        });
        it('should apply value directly', () => {
          expect(resource.then).to.be.equal('VALUE');
        });
      });
    });

    describe('apply', () => {
      let value;
      beforeEach(() => {
        value = result('command', 'value');
      });
      it('should call proxy handler', () => {
        expect(resource[ProxyCommandFields.apply]).to.be.calledOnce;
        expect(resource[ProxyCommandFields.apply]).to.be.calledWith(null, ['command', 'value']);
      });
    });

    describe('has', () => {
      it('should check field availability on target', () => {
        expect('item' in result).to.be.false;
        expect('then' in result).to.be.true;
      });
    });

    describe('deleteProperty', () => {
      let value;
      beforeEach(() => {
        value = delete result.property;
      });
      it('should call proxy handler', () => {
        expect(resource[ProxyCommandFields.deleteProperty]).to.be.calledOnce;
        expect(resource[ProxyCommandFields.deleteProperty]).to.be.calledWith('property');
      });
      it('should result with true', () => {
        expect(value).to.be.true;
      });

      describe('When handler is null', () => {
        let value;
        beforeEach(() => {
          delete resource[ProxyCommandFields.deleteProperty];
          value = delete result.property;
        });
        it('should result with false', () => {
          expect(value).to.be.false;
        });
      });

    });

    describe('getOwnPropertyDescriptor()', () => {
      let funcDescr,
        resDescr;
      beforeEach(() => {
        funcDescr = Object.getOwnPropertyDescriptor(result, 'prototype');
        resDescr = Object.getOwnPropertyDescriptor(result, 'then');
      });
      it('should return descriptor for wrapper function', () => {
        expect(funcDescr).to.be.eql(Object.getOwnPropertyDescriptor(() => {
        }, 'prototype'));
      });
      it('should return descriptor for wrapper function', () => {
        expect(resDescr).to.be.eql(Object.getOwnPropertyDescriptor(resource, 'then'));
      });
    });

    describe('enumerate', () => {
      let list;
      beforeEach(() => {
        list = [];
        for (const name in result) {
          list.push(name);
        }
      });
      it('should enumerate only wrapper function properties', () => {
        expect(list).to.contain('arguments');
        expect(list).to.contain('caller');
        expect(list).to.contain('prototype');
      });
    });

    describe('ownKeys', () => {
      let list;
      beforeEach(() => {
        list = Object.getOwnPropertyNames(result);
      });
      it('should list only wrapper function properties', () => {
        expect(list).to.contain('arguments');
        expect(list).to.contain('caller');
        expect(list).to.contain('prototype');
      });
    });

  });

  describe('RequestProxyFactory.create()', () => {
    let factory;
    beforeEach(() => {
      RequestFactory.create.reset();
      decorator.setFactory.reset();
      factory = RequestProxyFactory.create(handlers, cache);
    });
    it('should create factory', () => {
      expect(RequestFactory.create).to.be.calledOnce;
      expect(RequestFactory.create).to.be.calledWith(handlers, cache);
    });
    it('should reset decorator factory link', () => {
      expect(decorator.setFactory).to.be.calledOnce;
      expect(decorator.setFactory).to.be.calledWith(factory);
    });
  });

});
