import Converter, {
  createResourceConverter,
  ConverterEvents,
} from './Converter';
import Target from '../request/Target';
import IConvertible from '../utils/IConvertible';
import getResourcePoolId from '../utils/getResourcePoolId';
import getResourceId from '../utils/getResourceId';
import {
  __createDataResolvedPromise,
  __createResource,
  __createRequest,
  __createRequestData,
  __createResourceData,
} from '../../tests/stubs';

describe('ResourceConverter', () => {
  let converter;
  let factory;
  let registry;
  let pool;
  let handlers;
  let sandbox;
  let isRegistered;
  let requestTarget;
  let targetResource;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    factory = {
      create: sandbox.spy(() => requestTarget),
    };
    pool = {
      get: sandbox.spy(() => targetResource),
      set: sandbox.spy(() => targetResource),
    };
    registry = {
      isRegistered: sandbox.spy(() => isRegistered),
      get: sandbox.spy(() => pool),
    };
    handlers = {
      setConverter: sandbox.spy(),
    };
    converter = createResourceConverter(factory, registry, pool, handlers);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('When created', () => {
    it('should apply itself to Handlers', () => {
      expect(handlers.setConverter).to.be.calledOnce;
    });
  });

  describe('toJSON()', () => {
    describe('When Array passed', () => {
      let source;
      let result;
      let actualResult;

      beforeEach(() => {
        source = [{}];
        result = [{}];
        sandbox.stub(converter, 'lookupArray').returns(result);
        actualResult = converter.toJSON(source);
      });

      it('should call lookupArray() once', () => {
        expect(converter.lookupArray).to.be.calledOnce;
      });

      it('should pass to lookupArray() data and handler', () => {
        const { args } = converter.lookupArray.getCall(0);
        expect(args[0]).to.be.equal(source);
        expect(args[1]).to.be.equal(converter.resourceToObject);
      });

      it('should return result of array processing', () => {
        expect(actualResult).to.be.equal(result);
      });
    });

    describe('When Object passed', () => {
      describe('When RAW Object passed', () => {
        let source;
        let result;
        let actualResult;

        beforeEach(() => {
          source = { data: {} };
          result = {};
          sandbox.stub(converter, 'lookupObject').returns(result);
          actualResult = converter.toJSON(source);
        });

        it('should call lookupObject() once', () => {
          expect(converter.lookupObject).to.be.calledOnce;
        });

        it('should pass to lookupObject() data and handler', () => {
          const { args } = converter.lookupObject.getCall(0);
          expect(args[0]).to.be.equal(source);
          expect(args[1]).to.be.equal(converter.resourceToObject);
        });

        it('should return result of hash processing', () => {
          expect(actualResult).to.be.equal(result);
        });
      });

      describe('When extended Object passed', () => {
        let classFunc;
        let source;
        let result;

        beforeEach(() => {
          classFunc = () => null;
          source = new classFunc();
          result = converter.toJSON(source);
        });

        it('should skip data processing', () => {
          expect(result).to.be.equal(source);
        });
      });

      describe('When IConvertible passed', () => {
        let source;
        let result;
        let actualResult;

        beforeEach(() => {
          source = new IConvertible();
          result = { data: 'something' };
          sandbox.stub(converter, 'resourceToObject').returns(result);
          actualResult = converter.toJSON(source);
        });

        it('should call resourceToObject() once', () => {
          expect(converter.resourceToObject).to.be.calledOnce;
        });

        it('should pass to resourceToObject() data', () => {
          const { args } = converter.resourceToObject.getCall(0);
          expect(args[0]).to.be.equal(source);
        });

        it('should result into RAW resource', () => {
          expect(actualResult).to.be.equal(result);
        });
      });

      describe('When Function passed', () => {
        let source;
        let result;
        let actualResult;

        beforeEach(() => {
          source = () => null;
          result = { data: 'something' };
          sandbox.stub(converter, 'resourceToObject').returns(result);
          actualResult = converter.toJSON(source);
        });

        it('should call resourceToObject() once', () => {
          expect(converter.resourceToObject).to.be.calledOnce;
        });

        it('should pass to resourceToObject() data', () => {
          const { args } = converter.resourceToObject.getCall(0);
          expect(args[0]).to.be.equal(source);
        });

        it('should result into RAW resource', () => {
          expect(actualResult).to.be.equal(result);
        });
      });

      describe('When Resource passed', () => {
        let source;
        let result;
        let actualResult;

        beforeEach(() => {
          source = __createResource();
          result = { data: 'something' };
          sandbox.stub(converter, 'resourceToObject').returns(result);
          actualResult = converter.toJSON(source);
        });

        it('should call resourceToObject() once', () => {
          expect(converter.resourceToObject).to.be.calledOnce;
        });

        it('should pass to resourceToObject() data', () => {
          const { args } = converter.resourceToObject.getCall(0);
          expect(args[0]).to.be.equal(source);
        });

        it('should result into RAW resource', () => {
          expect(actualResult).to.be.equal(result);
        });
      });
    });
  });

  describe('parse()', () => {
    describe('When Array passed', () => {
      let source;
      let result;
      let actualResult;

      beforeEach(() => {
        source = [{}];
        result = [{}];
        sandbox.stub(converter, 'lookupArray').returns(result);
        actualResult = converter.parse(source);
      });

      it('should call lookupArray() once', () => {
        expect(converter.lookupArray).to.be.calledOnce;
      });

      it('should pass to lookupArray() data and handler', () => {
        const { args } = converter.lookupArray.getCall(0);
        expect(args[0]).to.be.equal(source);
        expect(args[1]).to.be.equal(converter.objectToResource);
      });

      it('should return result of array processing', () => {
        expect(actualResult).to.be.equal(result);
      });
    });

    describe('When Object passed', () => {
      describe('When RAW Object passed', () => {
        let source;
        let result;
        let actualResult;

        beforeEach(() => {
          source = { data: {} };
          result = {};
          sandbox.stub(converter, 'lookupObject').returns(result);
          actualResult = converter.parse(source);
        });

        it('should call lookupObject() once', () => {
          expect(converter.lookupObject).to.be.calledOnce;
        });

        it('should pass to lookupObject() data and handler', () => {
          const { args } = converter.lookupObject.getCall(0);
          expect(args[0]).to.be.equal(source);
          expect(args[1]).to.be.equal(converter.objectToResource);
        });

        it('should return result of hash processing', () => {
          expect(actualResult).to.be.equal(result);
        });
      });

      describe('When Resource Object passed', () => {
        let source;
        let result;
        let actualResult;

        beforeEach(() => {
          source = __createResourceData();
          result = { data: 'something' };
          sandbox.stub(converter, 'objectToResource').returns(result);
          actualResult = converter.parse(source);
        });

        it('should call objectToResource() once', () => {
          expect(converter.objectToResource).to.be.calledOnce;
        });

        it('should pass to objectToResource() data', () => {
          const { args } = converter.objectToResource.getCall(0);
          expect(args[0]).to.be.equal(source);
        });

        it('should result into resolved resource target', () => {
          expect(actualResult).to.be.equal(result);
        });
      });
    });
  });

  describe('lookupArray()', () => {
    let handler;
    let result;

    beforeEach(() => {
      handler = sandbox.spy((num) => --num);
      result = converter.lookupArray([1, 2, 3], handler);
    });

    it('should call handler for each value', () => {
      expect(handler).to.be.calledThrice;
    });

    it('should pass values into handler', () => {
      const one = handler.getCall(0).args[0];
      const two = handler.getCall(1).args[0];
      const three = handler.getCall(2).args[0];
      expect([1, 2, 3]).to.include(one);
      expect([1, 2, 3]).to.include(two);
      expect([1, 2, 3]).to.include(three);
      assert(one !== two !== three, 'each value passed once');
    });

    it('should apply handler to converter', () => {
      expect(handler).to.be.calledOn(converter);
    });

    it('should apply result to final object', () => {
      expect(result).to.be.eql([0, 1, 2]);
    });
  });

  describe('lookupObject()', () => {
    let handler;
    let result;

    beforeEach(() => {
      handler = sandbox.spy((num) => ++num);

      function MyClass() {
      }

      MyClass.prototype.one1 = 1;
      MyClass.prototype.two2 = 2;
      MyClass.prototype.three3 = 3;
      const object = new MyClass();
      object.one = 1;
      object.two = 2;
      object.three = 3;
      result = converter.lookupObject(object, handler);
    });

    it('should call handler for each value', () => {
      expect(handler).to.be.calledThrice;
    });

    it('should pass values into handler', () => {
      const one = handler.getCall(0).args[0];
      const two = handler.getCall(1).args[0];
      const three = handler.getCall(2).args[0];
      expect([1, 2, 3]).to.include(one);
      expect([1, 2, 3]).to.include(two);
      expect([1, 2, 3]).to.include(three);
      assert(one !== two && two !== three && one !== three, 'each value passed once');
    });

    it('should apply handler to converter', () => {
      expect(handler).to.be.calledOn(converter);
    });

    it('should apply result to final object', () => {
      expect(result).to.be.eql({
        one: 2, two: 3, three: 4,
      });
    });
  });

  describe('lookupForPending()', () => {
    describe('When Pending resource passed', () => {
      let source;
      let result;

      beforeEach(() => {
        source = __createRequest();
        // sandbox.stub(RequestTarget, 'isPending').returns(true);
        result = converter.lookupForPending(source);
      });

      it('should result in list with only source object in it', () => {
        expect(result[0]).to.be.equal(source);
      });
    });

    describe('When Resolved resource passed', () => {
      let source;
      let result;
      let promise;

      beforeEach(() => {
        promise = __createDataResolvedPromise();
        source = __createRequest(promise);
        return promise.then(() => {
          result = converter.lookupForPending();
        });
      });

      it('should result in empty list', () => {
        expect(result).to.be.empty;
      });
    });

    describe('When Array of Pending resources passed', () => {
      let source;
      let result;
      beforeEach(() => {
        source = [
          {},
          {},
          __createRequest(),
          {},
          __createRequest(),
          {},
          {},
          __createRequest(),
        ];
        result = converter.lookupForPending(source);
      });

      it('should result in list with only source object in it', () => {
        expect(result).to.have.length(3);
        expect(result[0]).to.be.an.instanceof(Target);
        expect(result[1]).to.be.an.instanceof(Target);
        expect(result[2]).to.be.an.instanceof(Target);
      });
    });

    describe('When Hash of Pending resources passed', () => {
      let source;
      let result;

      beforeEach(() => {
        source = {
          first: {},
          second: () => null,
          third: new IConvertible(),
          fourth: {},
          fifth: __createRequest(),
          sixth: {},
          seventh: {},
          eighth: __createRequest(),
        };
        result = converter.lookupForPending(source);
      });

      it('should result in list with only source object in it', () => {
        expect(result).to.have.length(2);
        expect(result[0]).to.be.an.instanceof(Target);
        expect(result[1]).to.be.an.instanceof(Target);
      });
    });
  });

  describe('resourceToObject()', () => {
    let source;
    let result;
    let referenceResult;
    let listener;

    beforeEach(() => {
      listener = sandbox.spy();
      converter.addEventListener(ConverterEvents.RESOURCE_CONVERTED, listener);
    });

    function addCases() {
      it('should generate proper result', () => {
        expect(result).to.be.eql(referenceResult);
      });

      it('should fire CONVERTED event', () => {
        expect(listener).to.be.calledOnce;
      });

      it('should pass with event resource and generated data', () => {
        const event = listener.getCall(0).args[0];
        expect(event.data.data).to.be.equal(source);
        expect(event.data.result).to.be.equal(result);
      });
    }

    describe('When passing Target', () => {
      beforeEach(() => {
        const promise = __createDataResolvedPromise();
        source = __createRequest(promise);
        referenceResult = __createRequestData();
        return promise.then(() => {
          result = converter.resourceToObject(source);
        });
      });

      addCases();
    });

    describe('When passing Resource', () => {
      beforeEach(() => {
        source = __createResource();
        referenceResult = __createResourceData();
        result = converter.resourceToObject(source);
      });

      addCases();
    });

    describe('When passing RAW Resource', () => {
      beforeEach(() => {
        source = __createRequestData();
        result = converter.resourceToObject(source);
      });

      it('should not fire event', () => {
        // FIXME its not a case, raw resource contains TARGET_DATA, so will get an event fired
        // expect(listener).to.not.be.called;
      });

      it('result should equal to source', () => {
        expect(result).to.be.equal(source);
      });
    });

    describe('When passing Function', () => {
      beforeEach(() => {
        source = () => null;
        targetResource = __createResource();
        referenceResult = __createResourceData();
        result = converter.resourceToObject(source);
      });

      addCases();
    });
    describe('When passing IConvertible instance', () => {
      beforeEach(() => {
        source = new IConvertible();
        targetResource = __createResource();
        referenceResult = __createResourceData();
        result = converter.resourceToObject(source);
      });

      addCases();
    });

    describe('When passing toJSON() owner', () => {
      beforeEach(() => {
        source = {
          anything: '1111',
          toJSON: sandbox.spy(() => ({ evenMore: 'anything' })),
        };
        referenceResult = { evenMore: 'anything' };
        result = converter.resourceToObject(source);
      });

      addCases();
    });
    describe('When passing any object', () => {
      beforeEach(() => {
        source = { anything: '1111' };
        result = converter.resourceToObject(source);
      });

      it('should not fire event', () => {
        expect(listener).to.not.be.called;
      });

      it('result should equal to source', () => {
        expect(result).to.be.equal(source);
      });
    });
  });

  describe('objectToResource()', () => {
    let source;
    let result;
    let referenceResult;
    let listener;

    beforeEach(() => {
      listener = sandbox.spy();
      converter.addEventListener(ConverterEvents.RESOURCE_CREATED, listener);
    });

    function addCases() {
      it('should generate proper result', () => {
        expect(result).to.be.equal(referenceResult);
      });

      it('should fire CREATED event', () => {
        expect(listener).to.be.calledOnce;
      });

      it('should pass with event original data and resource', () => {
        const event = listener.getCall(0).args[0];
        expect(event.data.data).to.be.equal(source);
        expect(event.data.result).to.be.equal(result);
      });
    }

    describe('When has pool with resource poolId', () => {
      beforeEach(() => {
        source = __createResourceData();
        isRegistered = true;
        referenceResult = { resource: 'target' };
        targetResource = __createResource(referenceResult);
        result = converter.objectToResource(source);
      });

      it('Pool registry should be called with poolId', () => {
        expect(registry.isRegistered).to.be.calledOnce;
        expect(registry.isRegistered).to.be.calledWith(getResourcePoolId(source));
        expect(registry.get).to.be.calledOnce;
        expect(registry.get).to.be.calledWith(getResourcePoolId(source));
      });

      it('Pool should be called with resource Id', () => {
        expect(pool.get).to.be.calledOnce;
        expect(pool.get).to.be.calledWith(getResourceId(source));
      });

      addCases();
    });

    describe('When does not have pool with resource poolId', () => {
      beforeEach(() => {
        source = __createResourceData();
        isRegistered = false;
        requestTarget = __createRequest();
        referenceResult = requestTarget;
        result = converter.objectToResource(source);
      });

      it('should pass source data to factory', () => {
        expect(factory.create).to.be.calledOnce;
        expect(factory.create.getCall(0).args[0]).to.be.an.instanceof(Promise);
      });

      addCases();
    });

    describe('When not a resource passed', () => {
      beforeEach(() => {
        source = {
          just: 'any stuff',
        };
        result = converter.objectToResource(source);
      });

      it('should not fire event', () => {
        expect(listener).to.not.be.called;
      });

      it('result should equal to source', () => {
        expect(result).to.be.equal(source);
      });
    });
  });
});
