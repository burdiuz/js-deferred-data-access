import RequestTarget, {
  isActive,
  canBeDestroyed,
  destroy,
  toJSON,
  isTemporary,
  setTemporary,
  getStatus,
  isPending,
  getQueueLength,
  getQueueCommands,
  hadChildPromises,
  getRawPromise,
  getRequestChildren,
  getChildren,
  getLastChild,
  getChildrenCount,
  sendRequest,
  createRequestTarget,
} from './RequestTarget';
import RequestTargetInternals from './RequestTargetInternals';
import { Deferred, TARGET_INTERNALS } from '../utils';

describe('RequestTarget', () => {
  let sandbox;
  let _RequestTargetInternals;

  before(() => {
    _RequestTargetInternals = RequestTargetInternals;
    sandbox = sinon.sandbox.create();
    RequestTargetInternals = sandbox.spy(() => {
      this.then = sandbox.spy();
      this.catch = sandbox.spy();
    });
  });

  after(() => {
    RequestTargetInternals = _RequestTargetInternals;
    sandbox.restore();
  });

  describe('When created', () => {
    let deferred,
      promise,
      request,
      handlers;
    beforeEach(() => {
      deferred = new Deferred();
      promise = deferred.promise;
      handlers = {};
      RequestTargetInternals.reset();
      request = new RequestTarget(promise, handlers);
    });
    it('should create *Internals', () => {
      assert(RequestTargetInternals.calledWithNew(), 'internals was created');
      expect(RequestTargetInternals).to.be.calledWith(request, promise, handlers);
    });
    it('should store *Internals', () => {
      expect(request[TARGET_INTERNALS]).to.be.an.instanceof(RequestTargetInternals);
    });
    describe('When subscribe', () => {
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
      beforeEach((done) => {
        deferred.resolve(__createRequestTargetData());
        deferred.promise.then(() => {
          done();
        });
      });
      it('should keep internals', () => {
        expect(request[TARGET_INTERNALS]).to.be.an.instanceof(RequestTargetInternals);
      });
    });
    describe('When resolved as not a resource', () => {
      beforeEach((done) => {
        deferred.resolve('-data3');
        deferred.promise.then(() => {
          done();
        });
      });
      it('should delete internals', () => {
        expect(request[TARGET_INTERNALS]).to.not.be.ok;
      });
      it('calling then() should subscribe to original promise', (done) => {
        request.then((data) => {
          expect(data).to.be.equal('-data3');
          done();
        });
      });
    });
    describe('When rejected', () => {
      beforeEach((done) => {
        deferred.reject('error data');
        deferred.promise.catch(() => {
          done();
        });
      });
      it('should delete internals', () => {
        expect(request[TARGET_INTERNALS]).to.not.be.ok;
      });
      it('calling catch() should subscribe to original promise', (done) => {
        request.catch((data) => {
          expect(data).to.be.equal('error data');
          done();
        });
      });
    });
  });

  describe('isActive()', () => {
    let target,
      isActive,
      result;
    beforeEach(() => {
      target = {};
      isActive = sandbox.stub().returns(false);
      target[TARGET_INTERNALS] = {
        isActive,
      };
      result = isActive(target);
    });
    it('should call internal function', () => {
      expect(isActive).to.be.calledOnce;
    });
    it('should return call result', () => {
      expect(result).to.be.false;
    });
    it('should be false for non-Resource target', () => {
      expect(isActive({})).to.be.false;
    });
  });
  describe('canBeDestroyed()', () => {
    let target,
      canBeDestroyed,
      result;
    beforeEach(() => {
      target = {};
      canBeDestroyed = sandbox.stub().returns(true);
      target[TARGET_INTERNALS] = {
        canBeDestroyed,
      };
      result = canBeDestroyed(target);
    });
    it('should call internal function', () => {
      expect(canBeDestroyed).to.be.calledOnce;
    });
    it('should return call result', () => {
      expect(result).to.be.true;
    });
    it('should be false for non-Resource target', () => {
      expect(canBeDestroyed({})).to.be.false;
    });
  });
  describe('destroy()', () => {
    let target,
      destroy,
      result;
    beforeEach(() => {
      target = {};
      destroy = sandbox.stub().returns({});
      target[TARGET_INTERNALS] = {
        destroy,
      };
      result = destroy(target);
    });
    it('should call internal function', () => {
      expect(destroy).to.be.calledOnce;
    });
    it('should return call result', () => {
      expect(result).to.be.an('object');
    });
    it('should return null for non-Resource target', () => {
      expect(destroy({})).to.be.null;
    });
  });
  describe('toJSON()', () => {
    let target,
      toJSON,
      result;
    beforeEach(() => {
      target = {};
      toJSON = sandbox.stub().returns({});
      target[TARGET_INTERNALS] = {
        toJSON,
      };
      result = toJSON(target);
    });
    it('should call internal function', () => {
      expect(toJSON).to.be.calledOnce;
    });
    it('should return call result', () => {
      expect(result).to.be.an('object');
    });
    it('should return null for non-Resource target', () => {
      expect(toJSON({})).to.be.null;
    });
  });
  describe('isPending()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        status: TargetStatus.PENDING,
      };
      result = isPending(target);
    });
    it('should result with TRUE if status is "pending"', () => {
      expect(result).to.be.true;
    });
    it('should be false for non-Resource target', () => {
      expect(isPending({})).to.be.false;
    });
  });
  describe('isTemporary()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        temporary: true,
      };
      result = isTemporary(target);
    });
    it('should result with TRUE if target is temporary', () => {
      expect(result).to.be.true;
    });
    it('should be undefined for non-Resource target', () => {
      expect(isTemporary({})).to.be.undefined;
    });
  });
  describe('setTemporary()', () => {
    let target;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        temporary: false,
      };
      setTemporary(target, true);
    });
    it('should update "temporary" value', () => {
      expect(target[TARGET_INTERNALS].temporary).to.be.true;
    });
    it('should silently skip for non-Resource', () => {
      const target = {};
      setTemporary(target, true);
      expect(target).to.not.have.property('temporary');
    });
  });
  describe('getStatus()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        status: TargetStatus.DESTROYED,
      };
      result = getStatus(target);
    });
    it('should result with target status', () => {
      expect(result).to.be.equal(TargetStatus.DESTROYED);
    });
    it('should return null for non-Resource target', () => {
      expect(getStatus({})).to.be.null;
    });
  });
  describe('getQueueLength()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        queue: [{}, {}, {}, {}],
      };
      result = getQueueLength(target);
    });
    it('should result with queue length', () => {
      expect(result).to.be.equal(4);
    });
    it('should return 0 for non-Resource target', () => {
      expect(getQueueLength({})).to.be.equal(0);
    });
  });
  describe('getQueueCommands()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        // queue has format [ [command, deferred], [command, deferred], [command, deferred], ...  ]
        queue: [[{ type: 'abc' }], [{ type: 'def' }], [{ type: 'ghi' }], [{ type: 'jkl' }]],
      };
      result = getQueueCommands(target);
    });
    it('should result with command types from queue', () => {
      expect(result).to.be.eql(['abc', 'def', 'ghi', 'jkl']);
    });
    it('should return empty list for non-Resource target', () => {
      expect(getQueueCommands({})).to.be.empty;
    });
  });
  describe('hadChildPromises()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        hadChildPromises: false,
      };
      result = hadChildPromises(target);
    });
    it('should result with internal hadChildPromises value', () => {
      expect(result).to.be.false;
    });
    it('should be undefined for non-Resource target', () => {
      expect(hadChildPromises({})).to.be.false;
    });
  });
  describe('getRawPromise()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        promise: {},
      };
      result = getRawPromise(target);
    });
    it('should result with targets promise', () => {
      expect(result).to.be.equal(target[TARGET_INTERNALS].promise);
    });
    it('should be null for non-Resource target', () => {
      expect(getRawPromise({})).to.be.null;
    });
  });
  describe('getChildren()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        children: [{}, {}, {}],
      };
      result = getChildren(target);
    });
    it('should result with list of children requests', () => {
      expect(result).to.have.length(3);
    });
    it('should be empty list for non-Resource target', () => {
      expect(getChildren({})).to.be.empty;
    });
  });
  describe('getLastChild()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        children: [{}, {}, {}],
      };
      result = getLastChild(target);
    });
    it('should result with last item from children', () => {
      expect(result).to.be.equal(target[TARGET_INTERNALS].children.pop());
    });
  });
  describe('getChildrenCount()', () => {
    let target,
      result;
    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        children: [{}, {}, {}],
      };
      result = getChildrenCount(target);
    });
    it('should result with children count', () => {
      expect(result).to.be.equal(3);
    });
    it('should be 0 for non-Resource target', () => {
      expect(getChildrenCount({})).to.be.equal(0);
    });
  });
  describe('createRequestTarget()', () => {
    it('should create instance of RequestTarget', () => {
      expect(createRequestTarget(Promise.reject(), {})).to.be.an.instanceof(RequestTarget);
    });
  });
});
