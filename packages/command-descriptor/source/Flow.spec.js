import Flow from './Flow';
import TARGET_INTERNALS from '../utils/TARGET_INTERNALS';
import { __createRequestData } from '../../tests/stubs';

describe('Flow', () => {
  let sandbox;
  let resourceFactory;
  let getCachedResult;
  let createResult;
  let isTemporaryFn;
  let isTemporaryResult;
  let cacheable;
  let flow;
  let resource;
  let resolveRequest;
  let requestData;

  function __createSendCommandRequest() {
    return {
      [TARGET_INTERNALS]: {
        promise: Promise.resolve(),
        send: sandbox.spy(() => {
          if (resolveRequest) {
            return Promise.resolve(requestData);
          }

          return Promise.reject(requestData);
        }),
        id: '1111',
        toJSON: sandbox.spy(() => __createRequestData()),
      },
    };
  }

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  after(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    resourceFactory = {
      getCached: sandbox.spy(() => getCachedResult),
      createCached: sandbox.spy(() => createResult),
      create: sandbox.spy(() => createResult),
    };

    isTemporaryFn = sandbox.spy(() => isTemporaryResult);
    cacheable = false;

    requestData = {};
    isTemporaryResult = true;
    resolveRequest = true;
    resource = __createSendCommandRequest();
    flow = new Flow(resourceFactory);
  });

  describe('When applying flow', () => {
    let child;

    describe('When target is a resource', () => {
      const sharedTestCases = () => {
        it('should send request', () => {
          expect(resource[TARGET_INTERNALS].send).to.be.calledOnce;
          expect(resource[TARGET_INTERNALS].send).to.be.calledWith(
            sinon.match({
              propertyName: 'property',
              command: 'command',
              args: ['value'],
              target: __createRequestData(),
            }),
            createResult,
          );
        });

        it('should return created child resource', () => {
          expect(child).to.be.equal(createResult);
        });

        it('should call isTemporary when fulfilled', () => resource[TARGET_INTERNALS].send.getCall(0).returnValue.then(() => {
          expect(isTemporaryFn).to.be.calledOnce;
          expect(isTemporaryFn).to.be.calledWith(
            resource,
            child,
            sinon.match({
              propertyName: 'property',
              command: 'command',
              args: ['value'],
              target: __createRequestData(),
            }),
            requestData,
          );
        }));

        it('should subscribe to request resolution', () => resource[TARGET_INTERNALS].send.getCall(0).returnValue.then(() => {
          expect(child[TARGET_INTERNALS].temporary).to.be.equal(isTemporaryResult);
        }));
      };

      describe('When cacheable child is cached', () => {
        beforeEach(() => {
          cacheable = true;
          getCachedResult = __createSendCommandRequest();
          child = flow.apply(resource, 'property', 'command', ['value'], isTemporaryFn, cacheable);
        });

        it('should request cached resource', () => {
          expect(resourceFactory.getCached).to.be.calledOnce;
          expect(resourceFactory.getCached).to.be.calledWith(
            sinon.match({
              propertyName: 'property',
              command: 'command',
              args: ['value'],
              target: __createRequestData(),
            }));
        });

        it('should result in cached resource', () => {
          expect(child).to.be.equal(getCachedResult);
        });

        it('should not send request', () => {
          expect(resource[TARGET_INTERNALS].send).to.not.be.called;
        });
      });

      describe('When cacheable child is null', () => {
        beforeEach(() => {
          cacheable = true;
          getCachedResult = null;
          createResult = __createSendCommandRequest();
          child = flow.apply(resource, 'property', 'command', ['value'], isTemporaryFn, cacheable);
        });

        it('should request cached resource', () => {
          expect(resourceFactory.getCached).to.be.calledOnce;
        });

        it('should create new cached resource', () => {
          expect(resourceFactory.create).to.be.calledOnce;
          expect(resourceFactory.create).to.be.calledWith(
            sinon.match.instanceOf(Promise),
            sinon.match({
              propertyName: 'property',
              command: 'command',
              args: ['value'],
              target: __createRequestData(),
            }),
            true,
          );
        });

        sharedTestCases();
      });

      describe('When descriptor is not cacheable', () => {
        beforeEach(() => {
          createResult = __createSendCommandRequest();
          child = flow.apply(resource, 'property', 'command', ['value'], isTemporaryFn, cacheable);
        });

        it('should request not cached resource', () => {
          expect(resourceFactory.getCached).to.not.be.called;
          expect(resourceFactory.createCached).to.not.be.called;
        });

        it('should create not cached resource', () => {
          expect(resourceFactory.create).to.be.calledOnce;
          expect(resourceFactory.create).to.be.calledWith(sinon.match.instanceOf(Promise));
        });

        sharedTestCases();
      });

      describe('When sending request fails', () => {
        beforeEach(() => {
          resolveRequest = false;
          createResult = __createSendCommandRequest();
          resourceFactory.create = sandbox.spy((promise) => promise);
          child = flow.apply(resource, 'property', 'command', ['value'], isTemporaryFn, cacheable);
        });

        // It does not create child request target twice
        it('should regenerate child resource', () => {
          expect(resourceFactory.create).to.be.calledOnce;
          expect(resourceFactory.create).to.be.calledWith(
            sinon.match.instanceOf(Promise),
            sinon.match({
              propertyName: 'property',
              command: 'command',
              args: ['value'],
              target: __createRequestData(),
            }),
            cacheable,
            );
        });

        it('should result into rejected promise', () => child
          .then(() => assert(false, 'should be rejected'))
          .catch((data) => null)
        );
      });
    });

    describe('When target is not a resource', () => {
      beforeEach(() => {
        resource = {};
        resourceFactory.create = sandbox.spy((promise) => promise);
        getCachedResult = __createSendCommandRequest();
        child = flow.apply(resource, 'property', 'command', ['value'], isTemporaryFn, cacheable);
      });

      it('should result in rejected promise', () => child
        .then(() => assert(false, 'should be rejected'))
        .catch((data) => expect(data).to.be.an.instanceof(Error)));

      it('should create new resource for promise', () => {
        expect(resourceFactory.create).to.be.calledOnce;
      });

      it('should pass promise into resource factory.create', () => {
        expect(resourceFactory.create.getCall(0).args[0]).to.be.an.instanceof(Promise);
      });
    });
  });
})
;
