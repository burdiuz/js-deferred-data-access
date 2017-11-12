/**
 * Created by Oleg Galaburda on 29.03.16.
 */

import Deferred from '../utils/Deferred';
import TARGET_INTERNALS from '../utils/TARGET_INTERNALS';
import CallbackFactory from './CallbackFactory';

describe('CallbackFactory', () => {
  let sandbox;
  let resourceFactory;
  let descriptor;
  let getResult;
  let createResult;
  let isTemporaryResult;
  let factory;
  let resource;
  let resolveRequest;
  let requestData;

  function __createSendCommandRequest() {
    const resource = {};
    resource[TARGET_INTERNALS] = {
      sendRequest: sandbox.spy((propertyName, pack, deferred) => {
        if (resolveRequest) {
          deferred.resolve(requestData);
        } else {
          deferred.reject(requestData);
        }
        return deferred.promise;
      }),
      id: '1111',
    };

    return resource;
  }

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  after(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    resourceFactory = {
      getCached: sandbox.spy(() => getResult),
      createCached: sandbox.spy(() => createResult),
      create: sandbox.spy(() => createResult),
    };

    descriptor = {
      name: 'property',
      type: 'commandType',
      handle: sandbox.spy(),
      isTemporary: sandbox.spy(() => isTemporaryResult),
      cacheable: false,
    };

    requestData = {};
    isTemporaryResult = true;
    resolveRequest = true;
    resource = __createSendCommandRequest();
    factory = new CallbackFactory();
    factory.setFactory(resourceFactory);
  });

  describe('When requested new member', () => {
    let result;

    beforeEach(() => {
      result = factory.get({
        name: 'property',
        handler: sandbox.spy(),
        type: 'command',
      });
    });

    it('should return new command handler', () => {
      expect(result).to.be.a('function');
    });

    describe('When requested same member', () => {
      let secondResult;

      beforeEach(() => {
        secondResult = factory.get({
          name: 'property',
          handler: sandbox.spy(),
          type: 'command',
        });
      });

      it('should return same command handler', () => {
        expect(secondResult).to.be.equal(result);
      });
    });
  });

  describe('When using generated method', () => {
    let child;

    describe('When target is not a resource', () => {
      beforeEach(() => {
        resource = {};
        resourceFactory.create = sandbox.spy((promise) => promise);
        getResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        child = resource.method('command', 'value');
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

    describe('When cacheable child is cached', () => {
      beforeEach(() => {
        descriptor.cacheable = true;
        getResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        child = resource.method('command', 'value');
      });

      it('should request cached resource', () => {
        expect(resourceFactory.getCached).to.be.calledOnce;
        expect(resourceFactory.getCached).to.be.calledWith('property', sinon.match({
          type: 'commandType',
          cmd: 'command',
          value: 'value',
          target: resource[TARGET_INTERNALS].id,
        }));
      });

      it('should result in cached resource', () => {
        expect(child).to.be.equal(getResult);
      });

      it('should not send request', () => {
        expect(resource[TARGET_INTERNALS].sendRequest).to.not.be.called;
      });
    });

    const sharedTestCases = () => {
      it('should send request', () => {
        expect(resource[TARGET_INTERNALS].sendRequest).to.be.calledOnce;
        expect(resource[TARGET_INTERNALS].sendRequest).to.be.calledWith(
          'property',
          sinon.match({
            type: 'commandType',
            cmd: 'command',
            value: 'value',
            target: resource[TARGET_INTERNALS].id,
          }),
          sinon.match.instanceOf(Deferred),
          createResult,
        );
      });

      it('should return created child resource', () => {
        expect(child).to.be.equal(createResult);
      });

      it('should call isTemporary when fulfilled', () => resource[TARGET_INTERNALS].sendRequest.getCall(0).returnValue.then(() => {
        expect(descriptor.isTemporary).to.be.calledOnce;
        expect(descriptor.isTemporary).to.be.calledWith(
          resource,
          child,
          sinon.match({
            type: 'commandType',
            cmd: 'command',
            value: 'value',
            target: resource[TARGET_INTERNALS].id,
          }),
          requestData,
        );
      }));

      it('should subscribe to request resolution', () => resource[TARGET_INTERNALS].sendRequest.getCall(0).returnValue.then(() => {
        expect(child[TARGET_INTERNALS].temporary).to.be.equal(isTemporaryResult);
      }));
    };

    describe('When cacheable child is null', () => {
      beforeEach(() => {
        descriptor.cacheable = true;
        getResult = null;
        createResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        child = resource.method('command', 'value');
      });

      it('should request cached resource', () => {
        expect(resourceFactory.getCached).to.be.calledOnce;
      });

      it('should create new cached resource', () => {
        expect(resourceFactory.createCached).to.be.calledOnce;
        expect(resourceFactory.createCached).to.be.calledWith(
          sinon.match.instanceOf(Promise),
          'property',
          sinon.match({
            type: 'commandType',
            cmd: 'command',
            value: 'value',
            target: resource[TARGET_INTERNALS].id,
          }),
        );
      });

      sharedTestCases();
    });

    describe('When descriptor is not cacheable', () => {
      beforeEach(() => {
        createResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        child = resource.method('command', 'value');
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
        createResult = __createSendCommandRequest();
        resource.method = factory.get(descriptor);
        resource[TARGET_INTERNALS].sendRequest = sinon.spy(() => null);
        resourceFactory.create = sandbox.spy((promise) => promise);
        child = resource.method('command', 'value');
      });

      it('should regenerate child resource', () => {
        expect(resourceFactory.create).to.be.calledTwice;
        expect(resourceFactory.create.getCall(1).args[0]).to.be.an.instanceof(Promise);
      });

      it('should result into rejected promise', () => child
        .then(() => assert(false, 'should be rejected'))
        .catch((data) => expect(data).to.be.an.instanceof(Error)));
    });
  });
});
