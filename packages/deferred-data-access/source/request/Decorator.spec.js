import Descriptor, { createDescriptor } from '../command/Descriptor';
import CallbackFactory from '../command/CallbackFactory';
import { createHandlers } from './Handlers';

const requestTargetDecoratorInjector = require('inject-loader!./Decorator');

describe('Decorator', () => {
  let module;
  let decorator;
  let resource;
  let factory;
  let handlers;
  let resolveRequest;
  let sandbox;
  let CallbackFactorySpy;
  let commandHFInstance;
  let commandHandlerResult;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  beforeEach(() => {
    commandHandlerResult = () => null;
    sandbox.stub(CallbackFactory.prototype, 'setFactory');
    sandbox.stub(CallbackFactory.prototype, 'get').callsFake(() => commandHandlerResult);
    CallbackFactorySpy = sandbox.spy(CallbackFactory);

    module = requestTargetDecoratorInjector({
      '../command/CallbackFactory': {
        default: CallbackFactorySpy,
        __esModule: true,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    factory = {};
    resource = {};
    resolveRequest = true;
    handlers = createHandlers();
    handlers.setCommands({
      action: sandbox.spy(),
      type: sandbox.spy(),
      property: createDescriptor('command', () => null, 'property', null, null, false, true),
    });

    decorator = module.createDecorator(factory, handlers);
    commandHFInstance = CallbackFactorySpy.getCall(0).thisValue;
  });

  describe('When created', () => {

    it('should instantiate CallbackFactory', () => {
      assert(CallbackFactorySpy.calledWithNew(), 'create factory');
    });
    it('should pass factory to CallbackFactory', () => {
      expect(commandHFInstance.setFactory).to.be.calledOnce;
      expect(commandHFInstance.setFactory).to.be.calledWith(factory);
    });
  });
  describe('When factory changed', () => {
    let newFactory;
    beforeEach(() => {
      newFactory = {};
      commandHFInstance.setFactory.reset();
      decorator.setFactory(newFactory);
    });
    it('should update factory for command handlers', () => {
      expect(commandHFInstance.setFactory).to.be.calledOnce;
      expect(commandHFInstance.setFactory).to.be.calledWith(newFactory);
    });
    it('should not pass NULL factory', () => {
      decorator.setFactory(null);
      expect(commandHFInstance.setFactory).to.be.calledOnce;
    });
  });

  describe('When handlers are not available', () => {
    beforeEach(() => {
      handlers.setCommands({});
    });
    it('should work as expected', () => {
      expect(() => {
        decorator.apply(resource);
      }).to.not.throw(Error);
    });
  });

  describe('When decorating request', () => {
    beforeEach(() => {
      decorator.apply(resource);
    });

    it('should add type members to target', () => {
      expect(resource.action).to.be.equal(commandHandlerResult);
      expect(resource.type).to.be.equal(commandHandlerResult);
    });

    it('should skip virtual descriptors', () => {
      expect(resource).to.not.have.property('property');
    });

    it('should request members from CallbackFactory', () => {
      expect(commandHFInstance.get).to.be.calledTwice;
      expect(commandHFInstance.get.getCall(0).args[0]).to.be.an.instanceof(Descriptor);
    });

    describe('When decorating other request', () => {
      let newRequest;
      beforeEach(() => {
        newRequest = {};
        decorator.apply(newRequest);
      });
      it('members should be same handlers', () => {
        expect(newRequest.action).to.be.equal(resource.action);
        expect(newRequest.type).to.be.equal(resource.type);
      });
    });

    describe('When handlers changed', () => {
      beforeEach(() => {
        handlers.setCommands({
          updated: sandbox.spy(),
        });

        resource = {};
        decorator.apply(resource);
      });
      it('members should be latest handlers', () => {
        expect(resource.updated).to.be.an('function');
        expect(resource.type).to.be.undefined;
      });
    });

  });

});
