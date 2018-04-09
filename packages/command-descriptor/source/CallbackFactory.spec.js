/**
 * Created by Oleg Galaburda on 29.03.16.
 */
const callbackFactoryInjector = require('inject-loader!./CallbackFactory');

describe('CallbackFactory', () => {
  let module;
  let sandbox;
  let CallbackFactory;
  let Flow;
  let flowInstance;
  let requestFactory;
  let descriptor;
  let factory;
  let resource;

  function FlowClass(targetFactory) {
    this.factory = targetFactory;
    this.apply = sandbox.spy(() => Promise.resolve);
    flowInstance = this;
  }

  beforeEach(() => {
    Flow = sandbox.spy(FlowClass);
    module = callbackFactoryInjector({
      './Flow': {
        default: Flow,
        __esModule: true,
      },
    });

    CallbackFactory = module.default;
  });

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  after(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    requestFactory = {};

    descriptor = {
      propertyName: 'property',
      command: 'commandType',
      handle: sandbox.spy(),
      isTemporary: () => null,
      cacheable: true,
    };

    factory = new CallbackFactory();
    factory.setFactory(requestFactory);
  });

  it('should create Flow and pass request factory', () => {
    expect(Flow).to.be.calledOnce;
    expect(Flow).to.be.calledWithExactly(requestFactory);
    expect(Flow).to.be.calledWithNew;
  });

  describe('When requested new member', () => {
    let result;

    beforeEach(() => {
      result = factory.get({
        propertyName: 'property',
        handler: sandbox.spy(),
        command: 'command',
      });
    });

    it('should return new command handler', () => {
      expect(result).to.be.a('function');
    });

    describe('When requested same member', () => {
      let secondResult;

      beforeEach(() => {
        secondResult = factory.get({
          propertyName: 'property',
          handler: sandbox.spy(),
          command: 'command',
        });
      });

      it('should return same command handler', () => {
        expect(secondResult).to.be.equal(result);
      });
    });
  });

  describe('When using generated method', () => {
    let result;

    beforeEach(() => {
      resource = { any: 'thing' };
      resource.method = factory.get(descriptor);
      result = resource.method('value');
    });

    it('should call command flow', () => {
      expect(flowInstance.apply).to.be.calledOnce;
      expect(flowInstance.apply).to.be.calledWithExactly(
        resource,
        'property',
        'commandType',
        ['value'],
        descriptor.isTemporary,
        true,
      );
    });

    it('should return flow promise', () => result);
  });
});
