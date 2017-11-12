import Descriptor, { createDescriptor } from '../command/Descriptor';
import { createDescriptors } from '../command/internal/ProxyCommands';
import { createDeferred } from '../utils/Deferred';
import filterHandlers from '../utils/filterRequestHandlers';
import Handlers, * as utils from './Handlers';

// const requestHandlersInjector = require('inject-loader!./Handlers');
const { createHandlers } = utils;

describe('Handlers', () => {
  let handlers;
  let sandbox;

  const __createProxyCommandHandlers = (data) => createDescriptors({
    get: sandbox.spy(),
    set: sandbox.spy(),
    apply: sandbox.spy(),
  }, data);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    handlers = createHandlers();
  });

  describe('When created', () => {
    beforeEach(() => {
      sandbox.spy(utils, 'areProxyHandlersAvailable');
    });

    it('should set proxyEnabled to false', () => {
      expect(handlers.proxyEnabled).to.be.false;
    });

    it('should be unavailable', () => {
      expect(handlers.available).to.be.false;
    });

    describe('setHandlers()', () => {
      let hndlr;
      let hndlrII;

      beforeEach(() => {
        hndlr = () => {
        };
        hndlrII = () => {
        };
        handlers.setHandlers({
          hndlr,
          hndlrII,
          fakeHandler: 'anything',
          fakeHandlerII: {},
        });
      });

      it('should throw an Error for handler of type named with reserved word', () => {
        expect(() => {
          handlers.setHandlers({
            then: () => {
            },
          });
        }).to.throw(Error);
        expect(() => {
          handlers.setHandlers({
            catch: 'not - a - type',
          });
        }).to.not.throw(Error);
      });

      it('should become available', () => {
        expect(handlers.available).to.be.true;
      });

      it('should not check handlers for compatibility with proxies', () => {
        expect(utils.areProxyHandlersAvailable).to.not.be.called;
      });

      it('should accept passed handlers', () => {
        expect(handlers.hasHandler('hndlr')).to.be.true;
      });

      it('should return false for non-existent handlers', () => {
        expect(handlers.hasHandler('abcdEFG')).to.be.false;
      });

      it('should return null when accessing non-existent handlers', () => {
        expect(handlers.getHandler('hijKLNM')).to.be.null;
      });

      it('handlers should be available', () => {
        expect(handlers.getHandler('hndlr')).to.be.an.instanceof(Descriptor);
        const allHandlers = handlers.getHandlers();
        expect(allHandlers.hndlr).to.be.an.instanceof(Descriptor);
        expect(allHandlers.hndlrII).to.be.an.instanceof(Descriptor);
      });

      /*
      it('handlers names should be listed', () => {
        expect(handlers.getHandlerNames()).to.contain('hndlr');
        expect(handlers.getHandlerNames()).to.contain('hndlrII');
      });
      */

      it('should filter functions only', () => {
        expect(handlers.hasHandler('fakeHandler')).to.be.false;
        expect(handlers.hasHandler('fakeHandlerII')).to.be.false;
      });
    });
  });
  /*
    describe('Iterator', () => {
      let handlers;

      beforeEach(() => {
        handlers = createHandlers();
        handlers.setHandlers({
          hndl1: () => {
          },
          hndl2: () => {
          },
          // adding virtual descriptor should not change iterator sequesnce, since it ignores virtual
          virtualProperty: createDescriptor(
            'command',
            () => null,
            'property',
            null,
            false,
            true,
          ),
        });
      });

      it('should be able to generate Iterators', () => {
        const iterator = handlers[Symbol.iterator]();
        expect(iterator).to.be.an('object');
        expect(iterator.next).to.be.a('function');
      });

      it('Iterator should go through all handlers', () => {
        const iterator = handlers[Symbol.iterator]();
        let item = iterator.next();
        expect(item.value).to.be.an.instanceof(Descriptor);
        expect(item.done).to.be.false;
        item = iterator.next();
        expect(item.value).to.be.an.instanceof(Descriptor);
        expect(item.done).to.be.false;
        item = iterator.next();
        expect(item.done).to.be.true;
      });

      it('should be iterator for itself', () => {
        const iterator = handlers[Symbol.iterator]();
        expect(iterator[Symbol.iterator]()).to.be.equal(iterator);
      });
    });
    */

  describe('When created with Proxies enabled', () => {
    beforeEach(() => {
      handlers = createHandlers(true);
    });

    describe('setHandlers()', () => {
      it('should throw for incompatible handlers', () => {
        expect(() => {
          handlers.setHandlers({
            hndlr: () => {
            },
          });
        }).to.throw(Error);
      });

      it('should accept compatible handlers', () => {
        expect(() => {
          handlers.setHandlers(__createProxyCommandHandlers());
        }).to.not.throw(Error);
      });

    });
  });

  describe('When list of descriptors used', () => {
    let list;

    beforeEach(() => {
      list = [
        createDescriptor('command1', () => {
        }, 'property1', null, false, false),
        createDescriptor('command2', () => {
        }, 'property2', null, false, true),
      ];
      handlers.setHandlers(list);
    });

    it('should add both descriptors', () => {
      expect(handlers.hasHandler('property1')).to.be.true;
      expect(handlers.hasHandler('property2')).to.be.true;
    });

    // FIXME if we need these methods, they can be easily restored from "properties" list
    /*
        it('getHandlerNames() should return all descriptors', () => {
          expect(handlers.getHandlerNames()).to.contain('property1');
          expect(handlers.getHandlerNames()).to.contain('property2');
        });
    */
    it('getHandlers() should contain all descriptors', () => {
      expect(handlers.getHandlers().property1).to.be.an.instanceof(Descriptor);
      expect(handlers.getHandlers().property2).to.be.an.instanceof(Descriptor);
    });
    /*
        it('getPropertyNames() should return non-virtual descriptors', () => {
          expect(handlers.getPropertyNames()).to.contain('property1');
          expect(handlers.getPropertyNames()).to.not.contain('property2');
        });
        */
  });

  describe('handle()', () => {
    let commandHandler;
    let resource;
    let pack;
    let deferred;

    beforeEach(() => {
      commandHandler = sandbox.spy(() => {
        deferred.resolve('something!');
      });
      resource = {};
      pack = {
        type: 'type',
      };
      deferred = createDeferred();
      handlers.setHandlers({
        type: commandHandler,
      });
    });

    it('should throw Error non-existent handler', () => {
      expect(() => {
        handlers.handle(resource, 'no-type', pack, deferred);
      }).to.throw(Error);
    });

    describe('When called', () => {
      beforeEach(() => {
        handlers.handle(resource, 'type', pack, deferred, null);
      });

      it('should call type handler', () => {
        expect(commandHandler).to.be.calledOnce;
      });

      it('should pass type parameters into handler', () => {
        const { args } = commandHandler.getCall(0);
        expect(args).to.be.eql([resource, pack, deferred, null]);
      });
    });

    describe('When converter was specified', () => {
      let converter;
      beforeEach(() => {
        converter = {};
        handlers.setConverter(converter);
      });

      describe('When has pending promises', () => {
        let pending;
        beforeEach(() => {
          pending = createDeferred();
          converter.lookupForPending = sandbox.spy(() => [pending.promise]);
          handlers.handle(resource, 'type', pack, deferred);
        });

        it('should not call handler immediately', () => {
          expect(commandHandler).to.not.be.called;
        });

        it('should check for pending', () => {
          expect(converter.lookupForPending).to.be.calledOnce;
        });

        it('should wait for pending promise', () => {
          pending.resolve('pending resolved');
          return deferred.promise.then(() => {
            expect(commandHandler).to.be.calledOnce;
          });
        });


      });

      describe('When no pending promises found', () => {
        beforeEach(() => {
          converter.lookupForPending = sandbox.spy(() => []);

          handlers.handle(resource, 'type', pack, deferred);
        });

        it('should check for pending', () => {
          expect(converter.lookupForPending).to.be.calledOnce;
        });

        it('should call handler immediately', () => {
          expect(commandHandler).to.be.calledOnce;
        });
      });

    });

  });

  describe('filterHandlers()', () => {
    let descriptors;
    let properties;
    beforeEach(() => {
      descriptors = {};
      properties = [];
    });
    it('should handle empty values', () => {
      expect(() => {
        filterHandlers(null, descriptors, properties);
        filterHandlers([], descriptors, properties);
        filterHandlers({ some: 'thing' }, descriptors, properties);
      }).to.not.throw(Error);
    });
    describe('When object passed', () => {
      let source;
      beforeEach(() => {
        source = {
          one: 'one',
          two: () => {
          },
          tree: 3,
        };

        filterHandlers(source, descriptors, properties);
      });
      it('should find all functions', () => {
        expect(Object.getOwnPropertyNames(descriptors)).to.have.length(1);
        expect(descriptors.two).to.be.an.instanceof(Descriptor);
        expect(descriptors.two.name).to.be.equal('two');
        expect(descriptors.two.type).to.be.equal('two');
      });
    });
    describe('When object contains Descriptor', () => {
      let source;
      beforeEach(() => {
        source = {
          one: 'one',
          two: new Descriptor('command', () => {
          }, 'name'),
          tree: 3,
        };

        filterHandlers(source, descriptors, properties);
      });
      it('should keep it unchanged', () => {
        expect(descriptors.two).to.not.be.ok;
        expect(descriptors.name.name).to.be.equal('name');
        expect(descriptors.name.type).to.be.equal('command');
      });
    });
    describe('When array passed', () => {
      let source;
      beforeEach(() => {
        source = ['one', new Descriptor('command', () => {
        }, 'name'), () => {
        }, 3];
        filterHandlers(source, descriptors, properties);
      });
      it('should store Descriptor\'s in result', () => {
        expect(Object.getOwnPropertyNames(descriptors)).to.have.length(1);
        expect(descriptors.name.name).to.be.equal('name');
        expect(descriptors.name.type).to.be.equal('command');
      });
    });
    describe('When using reserved words', () => {
      it('should throw error when reserved word used for property name', () => {
        expect(() => {
          filterHandlers([
            'one',
            new Descriptor('command1', () => {
            }, 'then'),
          ], descriptors, properties);
        }).to.throw(Error);
      });
    });
    describe('When using dupes', () => {
      it('should throw error when duplicated property name is found', () => {
        expect(() => {
          filterHandlers([
            'one',
            new Descriptor('command1', () => {
            }, 'name'),
            new Descriptor('command2', () => {
            }, 'name'),
            3,
          ], descriptors, properties);
        }).to.throw(Error);
      });
    });
  });

  describe('create()', () => {
    it('should create new instance of Handlers', () => {
      const result = createHandlers();
      expect(result).to.be.an.instanceof(Handlers);
      expect(result).to.not.be.equal(handlers);
    });
  });

});
