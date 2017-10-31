import {
  CommandDescriptor,
  createCommandDescriptor,
  createDescriptors,
} from '../commands';
import RequestHandlers, { areProxyHandlersAvailable } from './RequestHandlers';

describe('RequestHandlers', () => {
  let handlers;
  let sandbox;

  function __createProxyCommandHandlers(data, sandbox) {
    data = data || {};
    sandbox = sandbox || sinon;
    createDescriptors({
      get: sandbox.spy(),
      set: sandbox.spy(),
      apply: sandbox.spy(),
    }, sandbox.spy(), data);
    return data;
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    handlers = createRequestHandlers();
  });

  describe('When created', () => {
    beforeEach(() => {
      sandbox.spy(RequestHandlers, 'areProxyHandlersAvailable');
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
        expect(areProxyHandlersAvailable).to.not.be.called;
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
        expect(handlers.getHandler('hndlr')).to.be.an.instanceof(CommandDescriptor);
        const allHandlers = handlers.getHandlers();
        expect(allHandlers.hndlr).to.be.an.instanceof(CommandDescriptor);
        expect(allHandlers.hndlrII).to.be.an.instanceof(CommandDescriptor);
      });

      it('handlers names should be listed', () => {
        expect(handlers.getHandlerNames()).to.contain('hndlr');
        expect(handlers.getHandlerNames()).to.contain('hndlrII');
      });

      it('should filter functions only', () => {
        expect(handlers.hasHandler('fakeHandler')).to.be.false;
        expect(handlers.hasHandler('fakeHandlerII')).to.be.false;
      });
    });
  });

  describe('Iterator', () => {
    let handlers;

    beforeEach(() => {
      handlers = RequestHandlers.create();
      handlers.setHandlers({
        hndl1: () => {
        },
        hndl2: () => {
        },
        // adding virtual descriptor should not change iterator sequesnce, since it ignores virtual
        virtualProperty: createCommandDescriptor(
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
      expect(item.value).to.be.an.instanceof(CommandDescriptor);
      expect(item.done).to.be.false;
      item = iterator.next();
      expect(item.value).to.be.an.instanceof(CommandDescriptor);
      expect(item.done).to.be.false;
      item = iterator.next();
      expect(item.done).to.be.true;
    });

    it('should be iterator for itself', () => {
      const iterator = handlers[Symbol.iterator]();
      expect(iterator[Symbol.iterator]()).to.be.equal(iterator);
    });
  });

  describe('When created with Proxies enabled', () => {
    beforeEach(() => {
      handlers = RequestHandlers.create(true);
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
        CommandDescriptor.create('command1', () => {
        }, 'property1', null, false, false),
        CommandDescriptor.create('command2', () => {
        }, 'property2', null, false, true),
      ];
      handlers.setHandlers(list);
    });

    it('should add both descriptors', () => {
      expect(handlers.hasHandler('property1')).to.be.true;
      expect(handlers.hasHandler('property2')).to.be.true;
    });

    it('getHandlerNames() should return all descriptors', () => {
      expect(handlers.getHandlerNames()).to.contain('property1');
      expect(handlers.getHandlerNames()).to.contain('property2');
    });

    it('getHandlers() should contain all descriptors', () => {
      expect(handlers.getHandlers().property1).to.be.an.instanceof(CommandDescriptor);
      expect(handlers.getHandlers().property2).to.be.an.instanceof(CommandDescriptor);
    });

    it('getPropertyNames() should return non-virtual descriptors', () => {
      expect(handlers.getPropertyNames()).to.contain('property1');
      expect(handlers.getPropertyNames()).to.not.contain('property2');
    });
  });

  describe('handle()', () => {
    let commandHandler,
      resource,
      pack,
      deferred;
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
        const args = commandHandler.getCall(0).args;
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

        it('should wait for pending promise', (done) => {
          deferred.promise.then(() => {
            expect(commandHandler).to.be.calledOnce;
            done();
          });
          pending.resolve('pending resolved');
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
    let result;
    beforeEach(() => {
      result = {};
    });
    it('should handle empty values', () => {
      expect(() => {
        RequestHandlers.filterHandlers(null, result);
        RequestHandlers.filterHandlers([], result);
        RequestHandlers.filterHandlers({ some: 'thing' }, result);
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

        RequestHandlers.filterHandlers(source, result);
      });
      it('should find all functions', () => {
        expect(Object.getOwnPropertyNames(result)).to.have.length(1);
        expect(result.two).to.be.an.instanceof(CommandDescriptor);
        expect(result.two.name).to.be.equal('two');
        expect(result.two.type).to.be.equal('two');
      });
    });
    describe('When object contains CommandDescriptor', () => {
      let source;
      beforeEach(() => {
        source = {
          one: 'one',
          two: new CommandDescriptor('command', () => {
          }, 'name'),
          tree: 3,
        };

        RequestHandlers.filterHandlers(source, result);
      });
      it('should keep it unchanged', () => {
        expect(result.two).to.not.be.ok;
        expect(result.name.name).to.be.equal('name');
        expect(result.name.type).to.be.equal('command');
      });
    });
    describe('When array passed', () => {
      let source;
      beforeEach(() => {
        source = ['one', new CommandDescriptor('command', () => {
        }, 'name'), () => {
        }, 3];
        RequestHandlers.filterHandlers(source, result);
      });
      it('should store CommandDescriptor\'s in result', () => {
        expect(Object.getOwnPropertyNames(result)).to.have.length(1);
        expect(result.name.name).to.be.equal('name');
        expect(result.name.type).to.be.equal('command');
      });
    });
    describe('When using reserved words', () => {
      it('should throw error when reserved word used for property name', () => {
        expect(() => {
          RequestHandlers.filterHandlers([
            'one',
            new CommandDescriptor('command1', () => {
            }, 'then'),
          ], result);
        }).to.throw(Error);
      });
    });
    describe('When using dupes', () => {
      it('should throw error when duplicated property name is found', () => {
        expect(() => {
          RequestHandlers.filterHandlers([
            'one',
            new CommandDescriptor('command1', () => {
            }, 'name'),
            new CommandDescriptor('command2', () => {
            }, 'name'),
            3,
          ], result);
        }).to.throw(Error);
      });
    });
  });

  describe('create()', () => {
    it('should create new instance of RequestHandlers', () => {
      const result = createRequestHandlers();
      expect(result).to.be.an.instanceof(RequestHandlers);
      expect(result).to.not.be.equal(handlers);
    });
  });

});
