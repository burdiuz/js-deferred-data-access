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

  describe('isActive()', () => {
    let target;
    let isActive;
    let result;

    beforeEach(() => {
      target = {};
      isActive = sandbox.stub().returns(false);
      target[TARGET_INTERNALS] = {
        isActive,
      };
      result = module.isActive(target);
    });

    it('should call internal function', () => {
      expect(isActive).to.be.calledOnce;
    });

    it('should return call result', () => {
      expect(result).to.be.false;
    });

    it('should be false for non-Resource target', () => {
      expect(module.isActive({})).to.be.false;
    });
  });

  describe('canBeDestroyed()', () => {
    let target;
    let canBeDestroyed;
    let result;

    beforeEach(() => {
      target = {};
      canBeDestroyed = sandbox.stub().returns(true);
      target[TARGET_INTERNALS] = {
        canBeDestroyed,
      };
      result = module.canBeDestroyed(target);
    });

    it('should call internal function', () => {
      expect(canBeDestroyed).to.be.calledOnce;
    });

    it('should return call result', () => {
      expect(result).to.be.true;
    });

    it('should be false for non-Resource target', () => {
      expect(module.canBeDestroyed({})).to.be.false;
    });
  });

  describe('destroy()', () => {
    let target;
    let destroy;
    let result;

    beforeEach(() => {
      target = {};
      destroy = sandbox.stub().returns({});
      target[TARGET_INTERNALS] = {
        destroy,
      };
      result = module.destroy(target);
    });

    it('should call internal function', () => {
      expect(destroy).to.be.calledOnce;
    });

    it('should return call result', () => {
      expect(result).to.be.an('object');
    });

    it('should return null for non-Resource target', () => {
      expect(module.destroy({})).to.be.null;
    });
  });

  describe('toJSON()', () => {
    let target;
    let toJSON;
    let result;

    beforeEach(() => {
      target = {};
      toJSON = sandbox.stub().returns({});
      target[TARGET_INTERNALS] = {
        toJSON,
      };
      result = module.toJSON(target);
    });

    it('should call internal function', () => {
      expect(toJSON).to.be.calledOnce;
    });

    it('should return call result', () => {
      expect(result).to.be.an('object');
    });

    it('should return null for non-Resource target', () => {
      expect(module.toJSON({})).to.be.null;
    });
  });

  describe('isPending()', () => {
    let target;
    let result;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        status: TargetStatus.PENDING,
      };
      result = module.isPending(target);
    });

    it('should result with TRUE if status is "pending"', () => {
      expect(result).to.be.true;
    });

    it('should be false for non-Resource target', () => {
      expect(module.isPending({})).to.be.false;
    });
  });

  describe('isTemporary()', () => {
    let target;
    let result;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        temporary: true,
      };
      result = module.isTemporary(target);
    });

    it('should result with TRUE if target is temporary', () => {
      expect(result).to.be.true;
    });

    it('should be undefined for non-Resource target', () => {
      expect(module.isTemporary({})).to.be.undefined;
    });
  });

  describe('setTemporary()', () => {
    let target;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        temporary: false,
      };
      module.setTemporary(target, true);
    });

    it('should update "temporary" value', () => {
      expect(target[TARGET_INTERNALS].temporary).to.be.true;
    });

    it('should silently skip for non-Resource', () => {
      const target = {};
      module.setTemporary(target, true);
      expect(target).to.not.have.property('temporary');
    });
  });

  describe('getStatus()', () => {
    let target;
    let result;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        status: TargetStatus.DESTROYED,
      };
      result = module.getStatus(target);
    });

    it('should result with target status', () => {
      expect(result).to.be.equal(TargetStatus.DESTROYED);
    });

    it('should return null for non-Resource target', () => {
      expect(module.getStatus({})).to.be.null;
    });
  });

  describe('getQueueLength()', () => {
    let target;
    let result;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        queue: [{}, {}, {}, {}],
      };
      result = module.getQueueLength(target);
    });

    it('should result with queue length', () => {
      expect(result).to.be.equal(4);
    });

    it('should return 0 for non-Resource target', () => {
      expect(module.getQueueLength({})).to.be.equal(0);
    });
  });

  describe('getQueueCommands()', () => {
    let target;
    let result;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        /* queue has format
            [
              {name, command, deferred},
              {name, command, deferred},
              {name, command, deferred},
               ...
            ]
         */
        queue: new Queue([
          { name: 'command1', pack: { type: 'abc' } },
          { name: 'command2', pack: { type: 'def' } },
          { name: 'command3', pack: { type: 'ghi' } },
          { name: 'command4', pack: { type: 'jkl' } },
        ]),
      };
      result = module.getQueueCommands(target);
    });

    it('should result with command types from queue', () => {
      expect(result).to.be.eql(['command1', 'command2', 'command3', 'command4']);
    });

    it('should return empty list for non-Resource target', () => {
      expect(module.getQueueCommands({})).to.be.empty;
    });
  });

  describe('hadChildPromises()', () => {
    let target;
    let result;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        hadChildPromises: false,
      };
      result = module.hadChildPromises(target);
    });

    it('should result with internal hadChildPromises value', () => {
      expect(result).to.be.false;
    });

    it('should be undefined for non-Resource target', () => {
      expect(module.hadChildPromises({})).to.be.false;
    });
  });

  describe('getRawPromise()', () => {
    let target;
    let result;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        promise: Promise.resolve(),
      };
      result = module.getRawPromise(target);
    });

    it('should result with targets promise', () => {
      expect(result).to.be.equal(target[TARGET_INTERNALS].promise);
    });

    it('should be null for non-Resource target', () => {
      expect(module.getRawPromise({})).to.be.null;
    });
  });

  describe('getChildren()', () => {
    let target;
    let result;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        children: new Children([{}, {}, {}]),
      };
      result = module.getChildren(target);
    });

    it('should result with list of children requests', () => {
      expect(result).to.have.length(3);
    });

    it('should be empty list for non-Resource target', () => {
      expect(module.getChildren({})).to.be.empty;
    });
  });

  describe('getLastChild()', () => {
    let target;
    let result;
    let lastItem;

    beforeEach(() => {
      target = {};
      lastItem = {};
      target[TARGET_INTERNALS] = {
        children: new Children([{}, {}, lastItem]),
      };
      result = module.getLastChild(target);
    });

    it('should result with last item from children', () => {
      expect(result).to.be.equal(lastItem);
    });
  });

  describe('getChildrenCount()', () => {
    let target;
    let result;

    beforeEach(() => {
      target = {};
      target[TARGET_INTERNALS] = {
        children: [{}, {}, {}],
      };
      result = module.getChildrenCount(target);
    });

    it('should result with children count', () => {
      expect(result).to.be.equal(3);
    });

    it('should be 0 for non-Resource target', () => {
      expect(module.getChildrenCount({})).to.be.equal(0);
    });
  });

  describe('createRequestTarget()', () => {
    it('should create instance of Target', () => {
      expect(module.createRequestTarget(Promise.reject(), {})).to.be.an.instanceof(Target);
    });
  });
});
