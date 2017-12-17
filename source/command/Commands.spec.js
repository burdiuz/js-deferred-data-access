import Descriptor, { createDescriptor } from './Descriptor';
import { createDescriptors, ProxyPropertyNames } from './proxy/ProxyCommands';
import Handlers, * as utils from './Handlers';

// const requestHandlersInjector = require('inject-loader!./Handlers');
const { areProxyHandlersAvailable, createHandlers } = utils;

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
        hndlr = () => null;
        hndlrII = () => null;
      });

      describe('When adding default handlers', () => {
        beforeEach(() => {
          handlers.setCommands({
            hndlr,
            hndlrII,
            fakeHandler: 'anything',
            fakeHandlerII: {},
          });
        });

        it('should become available', () => {
          expect(handlers.available).to.be.true;
        });

        it('should not check handlers for compatibility with proxies', () => {
          expect(utils.areProxyHandlersAvailable).to.not.be.called;
        });

        it('should accept passed handlers', () => {
          expect(handlers.hasCommand('hndlr')).to.be.true;
        });

        it('should return false for non-existent handlers', () => {
          expect(handlers.hasCommand('fakeHandler')).to.be.false;
        });

        it('should return null when accessing non-existent handlers', () => {
          expect(handlers.getCommand('hijKLNM')).to.be.null;
        });

        it('handlers should be available', () => {
          expect(handlers.getCommand('hndlr')).to.be.an.instanceof(Descriptor);
          const allHandlers = handlers.getCommands();
          expect(allHandlers.hndlr).to.be.an.instanceof(Descriptor);
          expect(allHandlers.hndlrII).to.be.an.instanceof(Descriptor);
        });

        it('handlers names should be listed', () => {
          expect(handlers.getPropertyNames()).to.contain('hndlr');
          expect(handlers.getPropertyNames()).to.contain('hndlrII');
        });

        it('handlers should be listed', () => {
          const handlerList = handlers.getPropertyCommands().map((item) => item.handler);
          expect(handlerList).to.contain(hndlr);
          expect(handlerList).to.contain(hndlrII);
        });

        it('should filter functions only', () => {
          expect(handlers.hasCommand('fakeHandler')).to.be.false;
          expect(handlers.hasCommand('fakeHandlerII')).to.be.false;
        });
      });

      describe('When handler name is a reserved word', () => {
        it('should throw an Error', () => {
          expect(() => {
            handlers.setCommands({
              then: () => null,
            });
          }).to.throw(Error);
        });

        it('should skip if property not of handler type(function/object)', () => {
          expect(() => {
            handlers.setCommands({
              catch: 'not - a - type',
            });
          }).to.not.throw(Error);
        });
      });

      describe('When adding type-specific handlers', () => {
        let type;

        beforeEach(() => {
          type = 'my-type';
          handlers.setCommands({ [type]: { hndlr }, hndlrII });
        });

        it('type-specific handlers should be available only for type', () => {
          expect(handlers.hasCommand('hndlr')).to.be.false;
          expect(handlers.hasCommand('hndlrII')).to.be.true;
          expect(handlers.getCommand('hndlr')).to.be.null;
        });

        it('global handlers should be available for all', () => {
          expect(handlers.hasCommand('hndlr', type)).to.be.true;
          expect(handlers.hasCommand('hndlrII', type)).to.be.true;
          expect(handlers.getCommand('hndlr', type).handler).to.be.equal(hndlr);
        });

        it('handlers names should be listed', () => {
          expect(handlers.getPropertyNames(type)).to.contain('hndlr');
          expect(handlers.getPropertyNames(type)).to.not.contain('hndlrII');

          expect(handlers.getPropertyNames()).to.be.eql(['hndlrII']);
        });

        it('handlers should be listed', () => {
          expect(handlers.getPropertyCommands(type)).to.have.length(1);
          expect(handlers.getPropertyCommands(type)[0].handler).to.be.equal(hndlr);

          expect(handlers.getPropertyCommands()).to.have.length(1);
          expect(handlers.getPropertyCommands()[0].handler).to.be.eql(hndlrII);
        });

        describe('When requesting handlers', () => {
          let commands;

          describe('When requesting type-specific', () => {
            beforeEach(() => {
              commands = handlers.getCommands(type);
            });

            it('should return type-specific and global handlers', () => {
              expect(commands.hndlr.handler).to.be.equal(hndlr);
              expect(commands.hndlrII.handler).to.be.equal(hndlrII);
            });
          });

          describe('When requesting default', () => {
            beforeEach(() => {
              commands = handlers.getCommands();
            });

            it('should return only global handlers', () => {
              expect(commands.hndlr).to.be.undefined;
              expect(commands.hndlrII.handler).to.be.equal(hndlrII);
            });
          });
        });
      });
    });

    describe('setHandlersByType()', () => {

    });
  });

  describe('When created with Proxies enabled', () => {
    beforeEach(() => {
      handlers = createHandlers(true);
    });

    describe('setHandlers()', () => {
      it('should throw for incompatible handlers', () => {
        expect(() => {
          handlers.setCommands({
            hndlr: () => null,
          });
        }).to.throw(Error);
      });

      it('should accept compatible handlers', () => {
        expect(() => {
          handlers.setCommands(__createProxyCommandHandlers());
        }).to.not.throw(Error);
      });

    });
  });

  describe('When list of descriptors used', () => {
    let list;

    beforeEach(() => {
      list = [
        createDescriptor('command1', () => null, 'property1', null, false, false),
        createDescriptor('command2', () => null, 'property2', null, false, true),
      ];
      handlers.setCommands(list);
    });

    it('should add both descriptors', () => {
      expect(handlers.hasCommand('property1')).to.be.true;
      expect(handlers.hasCommand('property2')).to.be.true;
    });
    it('getHandlers() should contain all descriptors', () => {
      expect(handlers.getCommands().property1).to.be.an.instanceof(Descriptor);
      expect(handlers.getCommands().property2).to.be.an.instanceof(Descriptor);
    });
  });

  describe('call()', () => {
    let commandHandler;
    let resource;
    let pack;

    beforeEach(() => {
      commandHandler = sandbox.spy(() => Promise.resolve('something!'));
      resource = {};
      pack = {
        propertyName: 'myCommand',
        command: 'myCommand',
      };
      handlers.setCommands({
        myCommand: commandHandler,
      });
    });

    it('should throw Error non-existent handler', () => handlers
      .call(resource, pack)
      .then(() => assert(false, 'promise should not resolve'))
      .catch(() => null));

    describe('When called', () => {
      beforeEach(() => handlers.call(resource, pack, null));

      it('should call type handler', () => {
        expect(commandHandler).to.be.calledOnce;
      });

      it('should pass type parameters into handler', () => {
        const { args } = commandHandler.getCall(0);
        expect(args).to.be.eql([resource, pack, null]);
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
        let result;

        beforeEach(() => {
          pending = Promise.resolve('pending resolved');
          converter.lookupForPending = sandbox.spy(() => [pending.promise]);
          result = handlers.call(resource, pack);
        });

        it('should not call handler immediately', () => {
          expect(commandHandler).to.not.be.called;
        });

        it('should check for pending', () => {
          expect(converter.lookupForPending).to.be.calledOnce;
        });

        it('should wait for pending promise', () => result
          .then(() => {
            expect(commandHandler).to.be.calledOnce;
          }));
      });

      describe('When no pending promises found', () => {
        beforeEach(() => {
          converter.lookupForPending = sandbox.spy(() => []);

          handlers.call(resource, pack);
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

  describe('create()', () => {
    it('should create new instance of Handlers', () => {
      const result = createHandlers();
      expect(result).to.be.an.instanceof(Handlers);
      expect(result).to.not.be.equal(handlers);
    });
  });
});

describe('areProxyHandlersAvailable()', () => {
  describe('When all handlers are available', () => {
    let target;

    beforeEach(() => {
      target = {
        [ProxyPropertyNames.get]: () => null,
        [ProxyPropertyNames.set]: () => null,
        [ProxyPropertyNames.apply]: () => null,
      };
    });

    it('should result with true', () => {
      expect(areProxyHandlersAvailable(target)).to.be.true;
    });
  });

  describe('When some handlers are not available', () => {
    let target;

    beforeEach(() => {
      target = {
        [ProxyPropertyNames.get]: () => null,
        [ProxyPropertyNames.set]: () => null,
      };
    });

    it('should result with false', () => {
      expect(areProxyHandlersAvailable(target)).to.be.false;
    });

    it('should result with error if enabled', () => {
      expect(() => {
        areProxyHandlersAvailable(target, true);
      }).to.throw();
    });
  });
});
