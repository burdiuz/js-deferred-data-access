import CommandDescriptor, { createCommandDescriptor } from '../commands/CommandDescriptor';
import CommandHandlerFactory from '../commands/CommandHandlerFactory';
import RequestHandlers, { createRequestHandlers } from './RequestHandlers';
import RequestTargetDecorator, { createRequestTargetDecorator } from './RequestTargetDecorator';

describe('RequestTargetDecorator', () => {
  let decorator;
  let resource;
  let factory;
  let handlers;
  let requestData;
  let resolveRequest;
  let sandbox;
  let _CommandHandlerFactory;
  let commandHFInstance;
  let commandHandlerResult;

  before(() => {
    const { constructor } = CommandHandlerFactory.prototype;
    sandbox = sinon.sandbox.create();
    commandHandlerResult = () => {
    };

    // FIXME use inject-loader

    _CommandHandlerFactory = sandbox.stub(CommandHandlerFactory.prototype, 'constructor').callsFake((...args) => {
      commandHFInstance = this;
      constructor.apply(this, args);
    });
    sandbox.stub(CommandHandlerFactory.prototype, 'get').callsFake(() => commandHandlerResult);
    sandbox.stub(CommandHandlerFactory.prototype, 'setFactory');
  });

  after(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    factory = {};
    handlers = createRequestHandlers();
    handlers.setHandlers({
      action: sandbox.spy(),
      type: sandbox.spy(),
      property: createCommandDescriptor('command', () => null, 'property', null, false, true),
    });

    resolveRequest = true;

    resource = {};
    _CommandHandlerFactory.reset();
    decorator = createRequestTargetDecorator(factory, handlers);
  });

  describe('When created', () => {
    it('should instantiate CommandHandlerFactory', () => {
      assert(_CommandHandlerFactory.calledWithNew(), 'create factory');
    });
    it('should pass factory to CommandHandlerFactory', () => {
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
      handlers.setHandlers({});
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

    it('should request members from CommandHandlerFactory', () => {
      expect(commandHFInstance.get).to.be.calledTwice;
      expect(commandHFInstance.get.getCall(0).args[0]).to.be.an.instanceof(CommandDescriptor);
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
        handlers.setHandlers({
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
