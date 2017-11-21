/*
import Target, {
  isTemporary,
  setTemporary,
  getStatus,
  isPending,
  getQueueLength,
  getQueueCommands,
  hadChildPromises,
  getRawPromise,
  getChildren,
  getLastChild,
  getChildrenCount,
  createRequestTarget,
} from './RequestTarget';
import Internals from './Internals';
*/
import Deferred from '../utils/Deferred';
import TARGET_INTERNALS from '../utils/TARGET_INTERNALS';
import TargetStatus from '../utils/TargetStatus';
import Queue from './target/Queue';
import Children from './target/Children';
import {
  __createRequestData,
} from '../../tests/stubs';

const requestTargetInjector = require('inject-loader!./Target');

describe('RequestTarget', () => {
  const requestTargetInternalsModule = {
    default() {
      this.then = () => null;
      this.catch = () => null;
    },
    __esModule: true,
  };

  let sandbox;
  let module;
  let Target;

  beforeEach(() => {
    module = requestTargetInjector({
      './target/Internals': requestTargetInternalsModule,
    });
    Target = module.default;
  });

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('When created', () => {
    let Internals;
    let deferred;
    let promise;
    let request;
    let handlers;

    beforeEach(() => {
      Internals = sandbox.spy(requestTargetInternalsModule, 'default');
      deferred = new Deferred();
      promise = deferred.promise;
      handlers = {};
      request = new Target(promise, handlers);
    });

    it('should create *Internals', () => {
      assert(Internals.calledWithNew(), 'internals was created');
      expect(Internals).to.be.calledWith(request, promise, handlers);
    });

    it('should store *Internals', () => {
      expect(request[TARGET_INTERNALS]).to.be.an.instanceof(Internals);
    });

    describe('When subscribe', () => {
      beforeEach(() => {
        sandbox.spy(request[TARGET_INTERNALS], 'then');
        sandbox.spy(request[TARGET_INTERNALS], 'catch');
      });

      it('then() should call internal method', () => {
        request.then(() => {
        });
        expect(request[TARGET_INTERNALS].then).to.be.calledOnce;
      });

      it('catch() should call internal method', () => {
        request.catch(() => {
        });
        expect(request[TARGET_INTERNALS].catch).to.be.calledOnce;
      });
    });

    describe('When resolved as resource', () => {
      beforeEach(() => {
        deferred.resolve(__createRequestData());
        return deferred.promise;
      });

      it('should keep internals', () => {
        expect(request[TARGET_INTERNALS]).to.be.an.instanceof(Internals);
      });
    });

    describe('When resolved as not a resource', () => {
      beforeEach(() => {
        deferred.resolve('-data3');
        return deferred.promise;
      });

      it('should delete internals', () => {
        expect(request[TARGET_INTERNALS]).to.not.be.ok;
      });

      it('calling then() should subscribe to original promise', () => request.then((data) => {
        expect(data).to.be.equal('-data3');
      }));
    });

    describe('When rejected', () => {
      beforeEach(() => {
        deferred.reject('error data');
        return deferred.promise
          .then(() => assert(false, 'should be rejected'))
          .catch(() => null);
      });

      it('should delete internals', () => {
        expect(request[TARGET_INTERNALS]).to.not.be.ok;
      });

      it('calling catch() should subscribe to original promise', () => request
        .then(() => assert(false, 'should not resolve'))
        .catch((data) => expect(data).to.be.equal('error data')));
    });
  });

  describe('createRequestTarget()', () => {
    it('should create instance of Target', () => {
      expect(module.createRequestTarget(Promise.reject(), {})).to.be.an.instanceof(Target);
    });
  });
});
