/**
 * Created by Oleg Galaburda on 21.03.16.
 */

import Deferred, { createDeferred } from '../../utils/Deferred';
import TargetStatus from '../../utils/TargetStatus';
import TARGET_DATA from '../../utils/TARGET_DATA';

import RequestCommands, {
  RequestCommandNames,
  RequestCommandFields,
} from '../../command/internal/RequestCommands';
import {
  __createRequest,
  __createRequestData,
} from '../../../tests/stubs';

const internalsInjector = require('inject-loader!./Internals');

describe('Internals', () => {
  let sandbox;
  let module;
  let Internals;
  let SubTargets;
  let deferred;
  let internals;
  let requestTarget;
  let handlers;
  let handleResult;
  let linkData;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    class SubTargetsSpy {
      constructor() {
        this.parentResolved = sandbox.spy();
        this.parentRejected = sandbox.spy();
        this.register = sandbox.spy();
        this.send = sandbox.spy();
        this.hasQueue = sandbox.spy();
        this.setParent = sandbox.spy();
      }
    }

    SubTargets = SubTargetsSpy;

    module = internalsInjector({
      './SubTargets': {
        default: SubTargetsSpy,
        __esModule: true,
      },
    });
    Internals = module.default;
  });

  beforeEach(() => {
    requestTarget = {};
    handlers = {};
    deferred = createDeferred();
    internals = new Internals(requestTarget, deferred.promise, handlers);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be an instance of SubTargets', () => {
    expect(internals).to.be.an.instanceof(SubTargets);
  });

  it('should set parent for SubTargets', () => {
    expect(internals.setParent).to.be.calledOnce;
    expect(internals.setParent).to.be.calledWith(internals);
  });

  describe('When created, pending', () => {
    it('should store construction arguments', () => {
      expect(internals.target).to.be.equal(requestTarget);
      expect(internals.handlers).to.be.equal(handlers);
    });

    it('should initialize internals', () => {
      expect(internals.hadChildPromises).to.be.false;
      expect(internals.status).to.be.equal(TargetStatus.PENDING);
      expect(internals.data).to.be.undefined;
    });

    it('should have NULL data', () => {
      expect(internals.id).to.be.null;
      expect(internals.type).to.be.null;
      expect(internals.poolId).to.be.null;
    });

    it('should create child promise from passed', () => {
      expect(internals.promise).to.be.an.instanceof(Promise);
      expect(internals.promise).to.not.be.equal(deferred.promise);
    });

    it('should be active', () => {
      expect(internals.isActive()).to.be.true;
    });

    it('should not be destroyable', () => {
      expect(internals.canBeDestroyed()).to.be.false;
    });

    it('should reject destruction with error', () => internals.destroy()
      .then(() => assert(false, 'should not resolve'))
      .catch((result) => assert(result instanceof Error, 'result should be Error')));

    describe('When subscribing to promise', () => { // mark child promises created
      beforeEach(() => {
        internals.then(() => null);
      });

      it('should record that promise chain continues', () => {
        expect(internals.hadChildPromises).to.be.true;
      });
    });

  });

  describe('When fulfilled', () => {
    beforeEach(() => {
      linkData = __createRequestData();
      deferred.resolve(linkData);
      return deferred.promise;

    });

    it('should have proper data', () => {
      expect(internals.id).to.be.equal(linkData[TARGET_DATA].$id);
      expect(internals.type).to.be.equal(linkData[TARGET_DATA].$type);
      expect(internals.poolId).to.be.equal(linkData[TARGET_DATA].$poolId);
    });

    it('should change state to resolved', () => {
      expect(internals.status).to.be.equal(TargetStatus.RESOLVED);
    });

    it('should be active', () => {
      expect(internals.isActive()).to.be.true;
    });

    it('should report to sub-targets', () => {
      expect(internals.parentResolved).to.be.calledOnce;
      expect(internals.parentRejected).not.to.be.called;
    });

    it('should be destroyable after resolution', () => {
      expect(internals.canBeDestroyed()).to.be.true;
    });

    describe('When subscribing to the promise', () => {
      let subscriber;
      beforeEach(() => {
        subscriber = sandbox.spy();
        return internals.then(subscriber);
      });

      it('should resolve promises', () => {
        expect(subscriber).to.be.calledOnce;
      });

      it('should count subscriber', () => {
        expect(internals.hadChildPromises).to.be.true;
      });

      /*
      this is ambiguous, but I'll add this explicitly, so promise never
      should be resolved with promise-alike object, because in this case
      original promise will not be resolved, instead it will try to subscribe
      to resolution and wait for it.
      */
      it('should resolve with <not a promise> object', () => {
        const result = subscriber.getCall(0).args[0];
        expect(result).to.not.have.property('then');
        expect(result).to.not.have.property('catch');
      });

      it('should resolve with wrapper argument', () => {
        const result = subscriber.getCall(0).args[0];
        expect(result.target).to.be.equal(requestTarget);
      });
    });

    describe('When destroying', () => {
      beforeEach(() => {
        internals.destroy();
      });

      it('should send "destroy" request', () => {
        expect(internals.send).to.be.calledOnce;
        expect(internals.send.getCall(0).args[0])
          .to.be.equal(RequestCommandFields.DESTROY);
        expect(internals.send.getCall(0).args[1].command)
          .to.be.equal(RequestCommandNames.DESTROY);
      });
    });

  });

  describe('When fulfilled as temporary', () => {
    beforeEach(() => {
      linkData = __createRequestData();
      deferred.resolve(linkData);
      internals.temporary = true;
      return deferred.promise;
    });

    it('should have "destroyed" status', () => {
      expect(internals.status).to.be.equal(TargetStatus.DESTROYED);
    });

    it('should send "destroy" request', () => {
      expect(internals.send).to.be.calledOnce;
      expect(internals.send.getCall(0).args[0])
        .to.be.equal(RequestCommandFields.DESTROY);
      expect(internals.send.getCall(0).args[1].command)
        .to.be.equal(RequestCommandNames.DESTROY);
    });
  });

  describe('When rejected', () => {
    let child;

    beforeEach(() => {
      child = internals.send('1', 'one');
      linkData = {
        message: 'you screwed!',
      };
      deferred.reject(linkData);

      return deferred.promise
        .then(() => assert(false, 'should be rejected'))
        .catch(() => null);
    });

    it('should set status to rejected', () => {
      expect(internals.status).to.be.equal(TargetStatus.REJECTED);
    });

    it('should not be active', () => {
      expect(internals.isActive()).to.be.false;
    });

    it('should report to sub-targets', () => {
      expect(internals.parentResolved).not.to.be.called;
      expect(internals.parentRejected).to.be.calledOnce;
    });

    it('should be destroyable after resolution', () => {
      expect(internals.canBeDestroyed()).to.be.true;
    });

    describe('When subscribing to the promise', () => {
      let subscriber;
      beforeEach(() => {
        subscriber = sandbox.spy();

        return internals.catch(subscriber);
      });

      it('should count subscriber', () => {
        expect(internals.hadChildPromises).to.be.true;
      });

      it('should resolve promises', () => {
        expect(subscriber).to.be.calledOnce;
      });

      it('should resolve with original value', () => {
        const result = subscriber.getCall(0).args[0];
        expect(result).to.be.equal(linkData);
      });
    });

    describe('When destroying', () => {
      let result;
      beforeEach(() => {
        result = internals.destroy();
      });

      it('should resolve destruction', () => result.then((result) => assert(!result, 'result should be empty')));
    });

  });

  describe('When making child request', () => { // add to queue
    let result;

    beforeEach(() => {
      handleResult = 'hi :)';
      result = internals.send('command', {
        type: 'do-something',
        cmd: 'with-this',
        value: 'thanks',
      });
    });

    describe('When destroyed', () => {
      let promise;
      beforeEach(() => {
        promise = internals.destroy();
      });

      // they are all pending since parent is not resolved
      it('should reject destruction with error', () => promise
        .then(() => assert(false, 'should not resolve'))
        .catch((data) => expect(data).to.be.an.instanceof(Error)));
    });
  });

  describe('When destroyed', () => {
    beforeEach(() => {
      linkData = __createRequestData();
      deferred.resolve(linkData);
      return deferred.promise.then(() => internals.destroy());
    });

    it('should not be active', () => {
      expect(internals.isActive()).to.be.false;
    });
  });
});
