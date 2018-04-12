import Deferred from '../../../shared-utils/Deferred';
import TARGET_INTERNALS from '../utils/TARGET_INTERNALS';
import {
  __createRequestData,
} from '../../tests/stubs';

const requestTargetInjector = require('inject-loader!./Target');

describe('RequestTarget', () => {
  let requestTargetInternalsModule;
  let sandbox;
  let module;
  let Target;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  beforeEach(() => {
    requestTargetInternalsModule = {
      default() {
        this.then = sandbox.spy(() => Promise.resolve());
        this.catch = sandbox.spy(() => Promise.reject());
      },
      __esModule: true,
    };

    module = requestTargetInjector({
      './target/Internals': requestTargetInternalsModule,
    });
    Target = module.default;
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
      it('then() should call internal method', () => {
        request.then(() => null);
        expect(request[TARGET_INTERNALS].then).to.be.calledOnce;
      });

      it('catch() should call internal method', () => {
        request.catch(() => null);
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

      it('should keep internals', () => {
        expect(request[TARGET_INTERNALS]).to.be.ok;
      });

      it('calling then() should subscribe to internals', () => {
        const handler = () => null;
        request.then(handler);
        expect(request[TARGET_INTERNALS].then).to.be.calledOnce;
        expect(request[TARGET_INTERNALS].then).to.be.calledWith(handler);
      });
    });

    describe('When rejected', () => {
      beforeEach(() => {
        deferred.reject('error data');
        return deferred.promise
          .then(() => assert(false, 'should be rejected'))
          .catch(() => null);
      });

      it('should keep internals', () => {
        expect(request[TARGET_INTERNALS]).to.be.ok;
      });

      it('calling catch() should subscribe to internals promise', () => {
        const handler = () => null;
        request.catch(handler);
        expect(request[TARGET_INTERNALS].catch).to.be.calledOnce;
        expect(request[TARGET_INTERNALS].catch).to.be.calledWith(handler);
      });
    });
  });

  describe('createRequestTarget()', () => {
    it('should create instance of Target', () => {
      expect(module.createRequestTarget(Promise.reject(), {})).to.be.an.instanceof(Target);
    });
  });
});
