/**
 * Created by Oleg Galaburda on 21.03.16.
 */

import { Deferred, createDeferred, TargetStatus, TARGET_DATA } from '../utils';
import { RequestTargetCommands, RequestTargetCommandFields } from '../commands';
import RequestTargetInternals from './RequestTargetInternals';
import {
  __createRequestTarget,
  __createRequestTargetData,
} from '../../tests/stubs';

describe('RequestTargetInternals', () => {
  /**
   * @type {Deferred}
   */
  let deferred;
  /**
   * @type {RequestTargetInternals}
   */
  let target;
  /**
   * @type {RequestTarget}
   */
  let requestTarget;
  /**
   * @type {RequestHandlers}
   */
  let handlers;
  let isTemporaryResult;
  let handleResult;
  let linkData;
  let hasHandler;

  beforeEach(() => {
    requestTarget = {};
    hasHandler = true;
    handlers = {
      handle: sinon.spy((a, b, c, deferred) => {
        deferred.resolve(handleResult);
      }),
      hasHandler: sinon.spy(() => hasHandler),
      isTemporary: sinon.spy(() => isTemporaryResult),
    };
    deferred = createDeferred();
    target = new RequestTargetInternals(requestTarget, deferred.promise, handlers);
  });

  describe('When created, pending', () => {
    it('should store construction arguments', () => {
      expect(target.requestTarget).to.be.equal(requestTarget);
      expect(target.requestHandlers).to.be.equal(handlers);
    });

    it('should initialize internals', () => {
      expect(target.queue).to.be.an.instanceof(Array);
      expect(target.hadChildPromises).to.be.false;
      expect(target.status).to.be.equal(TargetStatus.PENDING);
      expect(target.link).to.be.an('object');
    });

    it('should have NULL data', () => {
      expect(target.id).to.be.null;
      expect(target.type).to.be.null;
      expect(target.poolId).to.be.null;
    });

    it('should create child promise from passed', () => {
      expect(target.promise).to.be.an.instanceof(Promise);
      expect(target.promise).to.not.be.equal(deferred.promise);
    });

    it('should be active', () => {
      expect(target.isActive()).to.be.true;
    });

    it('should not be destroyable', () => {
      expect(target.canBeDestroyed()).to.be.false;
    });

    it('should reject destruction with error', (done) => {
      target.destroy().catch((result) => {
        assert(result instanceof Error, 'result should be Error');
        done();
      });
    });

    describe('When making child request', () => { // add to queue
      let result;

      beforeEach(() => {
        handleResult = 'hi :)';
        result = target.sendRequest('command', {
          type: 'do-something',
          cmd: 'with-this',
          value: 'thanks',
        });
      });

      it('should have recorded request in queue', () => {
        expect(target.queue).to.have.length(1);
      });

      it('should not send request immediately', () => {
        expect(handlers.handle).to.not.be.called;
      });

      it('result of call should be a Promise', () => {
        expect(result).to.be.an.instanceof(Promise);
      });

      describe('When destroyed', () => {
        let promise;
        beforeEach(() => {
          promise = target.destroy();
        });

        // they are all pending since parent is not resolved
        it('should reject destruction with error', (done) => {
          promise.catch((data) => {
            expect(data).to.be.an.instanceof(Error);
            done();
          });
        });
      });

    });

    describe('When subscribing to promise', () => { // mark child promises created
      beforeEach(() => {
        target.then(() => {
        });
      });

      it('should record that promise chain continues', () => {
        expect(target.hadChildPromises).to.be.true;
      });
    });

  });

  describe('When fulfilled', () => {
    beforeEach((done) => {
      linkData = __createRequestTargetData();
      deferred.resolve(linkData);
      deferred.promise.then(() => {
        done();
      });

    });

    it('should have proper data', () => {
      expect(target.id).to.be.equal(linkData[TARGET_DATA].id);
      expect(target.type).to.be.equal(linkData[TARGET_DATA].type);
      expect(target.poolId).to.be.equal(linkData[TARGET_DATA].poolId);
    });

    it('should change state to resolved', () => {
      expect(target.status).to.be.equal(TargetStatus.RESOLVED);
    });

    it('should destroy queue list', () => {
      expect(target.queue).to.be.null;
    });

    it('should be active', () => {
      expect(target.isActive()).to.be.true;
    });

    it('should be destroyable after resolution', () => {
      expect(target.canBeDestroyed()).to.be.true;
    });

    describe('When subscribing to the promise', () => {
      let subscriber;
      beforeEach((done) => {
        subscriber = sinon.spy(() => {
          done();
        });
        target.then(subscriber);
      });

      it('should resolve promises', () => {
        expect(subscriber).to.be.calledOnce;
      });

      it('should count subscriber', () => {
        expect(target.hadChildPromises).to.be.true;
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

    describe('When making child request', () => { // handle immediately
      let result;
      beforeEach(() => {
        handleResult = 'nope';
        result = target.sendRequest('name', {
          type: 'type',
          cmd: 'command',
          value: 'way-lue',
          target: target.id,
        });
      });

      it('should not use queue', () => {
        expect(target.queue).to.be.null;
      });

      it('should handle request immediately', () => {
        expect(handlers.handle).to.be.calledOnce;
        const { args } = handlers.handle.getCall(0);
        expect(args[0]).to.be.equal(requestTarget);
        expect(args[1]).to.be.equal('name');
        expect(args[2]).to.be.eql({
          type: 'type',
          cmd: 'command',
          value: 'way-lue',
          target: target.id,
        });
        expect(args[3]).to.be.an.instanceof(Deferred);
      });
    });

    describe('When destroying', () => {
      beforeEach(() => {
        sinon.stub(target, 'sendRequest');
        target.destroy();
      });

      it('should send "destroy" request', () => {
        expect(target.sendRequest).to.be.calledOnce;
        expect(target.sendRequest.getCall(0).args[0])
          .to.be.equal(RequestTargetCommandFields.DESTROY);
        expect(target.sendRequest.getCall(0).args[1].type)
          .to.be.equal(RequestTargetCommands.DESTROY);
      });
    });

  });

  describe('When fulfilled as temporary', () => {
    beforeEach((done) => {
      linkData = __createRequestTargetData();
      deferred.resolve(linkData);
      target.temporary = true;
      sinon.spy(target, 'sendRequest');
      deferred.promise.then(() => {
        done();
      });
    });

    it('should have "destroyed" status', () => {
      expect(target.status).to.be.equal(TargetStatus.DESTROYED);
    });

    it('should send "destroy" request', () => {
      expect(target.sendRequest).to.be.calledOnce;
      expect(target.sendRequest.getCall(0).args[0])
        .to.be.equal(RequestTargetCommandFields.DESTROY);
      expect(target.sendRequest.getCall(0).args[1].type)
        .to.be.equal(RequestTargetCommands.DESTROY);
    });
  });

  describe('When fulfilled with pending queue', () => {
    beforeEach((done) => {
      target.sendRequest('name', { type: 'type', cmd: 'command', value: 'way-lue' });
      target.sendRequest('no-name', { type: 'no-type', cmd: 'no-command', value: 'no-way-lue' });
      linkData = __createRequestTargetData();
      deferred.resolve(linkData);
      deferred.promise.then(() => {
        done();
      });
    });

    it('should change state to resolved', () => {
      expect(target.status).to.be.equal(TargetStatus.RESOLVED);
    });

    it('should send queued requests', () => {
      expect(handlers.handle).to.be.calledTwice;
      expect(handlers.handle).to.be.calledWith(requestTarget, 'name');
      expect(handlers.handle).to.be.calledWith(requestTarget, 'no-name');
    });

    it('should destroy queue list', () => {
      expect(target.queue).to.be.null;
    });
  });

  describe('When fulfilled with not-a-Resource value', (done) => {
    let promise;
    beforeEach(() => {
      promise = target.sendRequest('1', { type: 'one' });
      deferred.resolve(1983);
      deferred.promise.then(() => {
        done();
      });
    });

    it('should reject queued requests', (done) => {
      promise.catch((data) => {
        expect(data).to.be.an.instanceof(Error);
        done();
      });
    });

  });

  describe('When rejected', () => {
    let child;
    beforeEach((done) => {

      child = target.sendRequest('1', 'one');

      linkData = {
        message: 'you screwed!',
      };
      deferred.reject(linkData);
      deferred.promise.catch(() => {
        done();
      });
    });

    it('should set status to rejected', () => {
      expect(target.status).to.be.equal(TargetStatus.REJECTED);
    });

    it('should not be active', () => {
      expect(target.isActive()).to.be.false;
    });

    it('should be destroyable after resolution', () => {
      expect(target.canBeDestroyed()).to.be.true;
    });

    it('should reject queue', (done) => {
      child.catch((data) => {
        expect(data).to.be.an.instanceof(Error);
        done();
      });
    });

    describe('When making child request', () => { // reject immediately
      let result;
      beforeEach(() => {
        result = target.sendRequest('any-name', {
          type: 'any-type',
          cmd: 'any-command',
          value: 'any-way-lue',
        });
      });

      it('promise should be rejected', (done) => {
        result.catch((data) => {
          assert(data instanceof Error, 'promise result must be an error instance');
          done();
        });
      });
      it('should handle request internally', () => {
        expect(handlers.handle).to.not.be.called;
      });
    });

    describe('When subscribing to the promise', () => {
      let subscriber;
      beforeEach((done) => {
        subscriber = sinon.spy(() => {
          done();
        });
        target.catch(subscriber);
      });

      it('should count subscriber', () => {
        expect(target.hadChildPromises).to.be.true;
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
        result = target.destroy();
      });

      it('should resolve destruction', (done) => {
        result.then((result) => {
          assert(!result, 'result should be empty');
          done();
        });
      });
    });

  });

  describe('When destroyed', () => {
    beforeEach((done) => {
      linkData = __createRequestTargetData();
      deferred.resolve(linkData);
      deferred.promise.then(() => {
        target.destroy();
        done();
      });
    });

    it('should not be active', () => {
      expect(target.isActive()).to.be.false;
    });

    describe('When making child request', () => { // reject immediately
      let result;
      beforeEach(() => {
        handlers.handle.reset();
        result = target.sendRequest('any-name', {
          type: 'any-type',
          cmd: 'any-command',
          value: 'any-way-lue',
        });
      });

      it('promise should be rejected', (done) => {
        result.catch((data) => {
          assert(data instanceof Error, 'promise result must be an error instance');
          done();
        });
      });

      it('should handle request internally', () => {
        expect(handlers.handle).to.not.be.called;
      });
    });
  });

  describe('When registering children', () => {
    let child;
    describe('When registered child is fulfilled', () => {
      beforeEach((done) => {
        linkData = __createRequestTargetData();
        deferred.resolve(linkData);
        deferred.promise.then(() => {
          child = __createRequestTarget();
          target.registerChild(child);
          done();
        });
      });

      it('should add pending child to the list', () => {
        expect(target.children).to.have.length(1);
        expect(target.children).to.contain(child);
      });

      it('should remove child from the list when its resolved', (done) => {
        child.then(() => {
          expect(target.children).to.not.contain(child);
          done();
        });
      });
    });

    describe('When registered child is rejected', () => {
      beforeEach((done) => {
        linkData = __createRequestTargetData();
        deferred.resolve(linkData);
        deferred.promise.then(() => {
          const promise = Promise.reject('bad child');
          child = __createRequestTarget(promise);
          target.registerChild(child);
          done();
        });
      });

      it('should add pending child to the list', () => {
        expect(target.children).to.have.length(1);
        expect(target.children).to.contain(child);
      });

      it('should remove child from the list when its rejected', (done) => {
        child.catch(() => {
          expect(target.children).to.not.contain(child);
          done();
        });
      });
    });
  });

  describe('When sending request', () => {
    describe('When target was fulfilled', () => {
      beforeEach((done) => {
        linkData = __createRequestTargetData();
        deferred.resolve(linkData);
        deferred.promise.then(() => {
          hasHandler = false;
          done();
        });
      });

      it('should immediately throw error on not existent handler', () => {
        expect(() => {
          target.sendRequest('any', { type: 'thing' });
        }).to.throw(Error);
      });

      describe('When passing child request', () => {
        let child;

        beforeEach(() => {
          child = __createRequestTarget();
          hasHandler = true;
          sinon.spy(target, 'registerChild');
          target.sendRequest('any', {}, null, child);
        });

        it('should register child', () => {
          expect(target.registerChild).to.be.calledOnce;
          expect(target.registerChild).to.be.calledWith(child);
        });
      });

    });
  });

});
