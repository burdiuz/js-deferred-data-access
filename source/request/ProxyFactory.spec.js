/**
 * Created by Oleg Galaburda on 29.03.16.
 */

import { ProxyCommandFields } from '../command/internal/ProxyCommands';
import { __createRequestData } from '../../tests/stubs';
// import Factory, { createRequestFactory } from './RequestFactory';
// import ProxyFactory, { createProxyFactory } from './ProxyFactory';

const requestProxyFactoryInjector = require('inject-loader!./ProxyFactory');

describe('ProxyFactory', () => {
  let Factory;
  let createRequestFactory;
  let module;
  let sandbox;
  let resource;
  let baseFactory;
  let decorator;
  let handlers;
  let cache;
  let factory;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  class FakeTarget {
  }

  beforeEach(() => {
    resource = new FakeTarget();
    resource.then = sandbox.spy();
    resource.catch = sandbox.spy();
    resource[ProxyCommandFields.get] = sandbox.spy();
    resource[ProxyCommandFields.set] = sandbox.spy();
    resource[ProxyCommandFields.apply] = sandbox.spy();
    resource[ProxyCommandFields.deleteProperty] = sandbox.spy();
    baseFactory = {
      getCached: sandbox.spy(() => resource),
      create: sandbox.spy(() => resource),
    };
    decorator = {
      setFactory: sandbox.spy(),
    };
    baseFactory.decorator = decorator;
    Factory = sandbox.spy(() => null);
    createRequestFactory = sandbox.spy(() => baseFactory);

    module = requestProxyFactoryInjector({
      './Factory': {
        createRequestFactory,
        default: Factory,
        __esModule: true,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    const ProxyFactory = module.default;
    handlers = {
      available: true,
    };

    factory = new ProxyFactory(handlers, cache);
  });

  it('should create factory', () => {
    expect(createRequestFactory).to.be.calledOnce;
    expect(createRequestFactory).to.be.calledWith(handlers, cache);
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
    let result;
    let pack;

    beforeEach(() => {
      pack = {
        command: 'type',
        args: ['command', 'value'],
        target: __createRequestData(),
      };
      result = factory.getCached('property', pack);
    });

    it('should request base factory', () => {
      expect(baseFactory.getCached).to.be.calledOnce;
      expect(baseFactory.getCached).to.be.calledWith('property', pack);
    });
  });

  describe('create() cached', () => {
    let result;
    let pack;

    beforeEach(() => {
      pack = {
        command: 'type',
        args: ['command', 'value'],
        target: __createRequestData(),
      };
    });

    describe('When handlers are available', () => {
      beforeEach(() => {
        handlers.available = true;
        result = factory.create(Promise.reject(), 'property', pack, true);
      });

      it('should return wrapped resource', () => {
        expect(result).to.be.a('function');
      });

      it('should request base factory', () => {
        expect(baseFactory.create).to.be.calledOnce;
        expect(baseFactory.create).to.be.calledWith(
          sinon.match.instanceOf(Promise),
          'property',
          pack,
          true,
        );
      });
    });

    describe('When handlers are not available', () => {
      beforeEach(() => {
        handlers.available = false;
        result = factory.create(Promise.reject(), 'property', pack, true);
      });

      it('should return normal resource', () => {
        expect(result).to.be.equal(resource);
      });

      it('should request base factory', () => {
        expect(baseFactory.create).to.be.calledOnce;
        expect(baseFactory.create).to.be.calledWith(
          sinon.match.instanceOf(Promise),
          'property',
          pack,
          true,
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
        let name;
        let value;

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

      describe('When no handler registered', () => {
        beforeEach(() => {
          delete resource[ProxyCommandFields.set];
        });

        it('should throw an error', () => {
          expect(() => {
            result.anything = 'nothing';
          }).to.throw();
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
        });

        it('should result with false', () => {
          expect(() => {
            value = delete result.property;
          }).to.throw();
        });
      });
    });

    describe('getOwnPropertyDescriptor()', () => {
      let funcDescr;
      let resDescr;

      beforeEach(() => {
        funcDescr = Object.getOwnPropertyDescriptor(result, 'prototype');
        resDescr = Object.getOwnPropertyDescriptor(result, 'then');
      });

      it('should return descriptor for wrapper function', () => {
        expect(funcDescr).to.be.eql(Object.getOwnPropertyDescriptor(() => null, 'prototype'));
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

      it('should enumerate properties', () => {
        expect(list).to.contain('then');
        expect(list).to.contain('catch');
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

    describe('getPrototypeOf', () => {
      it('should be instanceof Target', () => {
        expect(result).to.be.instanceof(FakeTarget);
      });
    });
  });

  describe('createProxyFactory()', () => {
    let factory;

    beforeEach(() => {
      createRequestFactory.reset();
      decorator.setFactory.reset();
      factory = module.createProxyFactory(handlers, cache);
    });

    it('should create factory', () => {
      expect(createRequestFactory).to.be.calledOnce;
      expect(createRequestFactory).to.be.calledWith(handlers, cache);
    });

    it('should reset decorator factory link', () => {
      expect(decorator.setFactory).to.be.calledOnce;
      expect(decorator.setFactory).to.be.calledWith(factory);
    });
  });
});
