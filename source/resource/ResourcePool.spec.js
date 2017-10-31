import { TARGET_DATA } from '../utils';
import ResourcePool, {
  ResourcePoolEvents,
  setValidTargets,
  getDefaultValidTargets,
  isValidTarget,
  createResourcePool,
} from './ResourcePool';
import TargetResource from './TargetResource';
import {
  __createRequestTarget,
  __createRequestTargetProxy,
  __createTargetResource,
} from '../../tests/stubs';

describe('ResourcePool', () => {
  let pool;
  let target1;
  let target2;
  let resource1;
  let resource2;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    pool = new ResourcePool();
    resource1 = pool.set(target1 = {});
    resource2 = pool.set(target2 = {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('When created', () => {
    it('should have own ID', () => {
      expect(pool.id).to.be.a('string');
    });

    it('should be active', () => {
      expect(pool.isActive()).to.be.true;
    });
  });

  describe('When adding target', () => {
    let target = {};
    let result;

    describe('When adding new', () => {
      let listener;

      beforeEach(() => {
        listener = sandbox.spy();
        pool.addEventListener(ResourcePoolEvents.RESOURCE_ADDED, listener);
        result = pool.set(target);
      });

      it('should return instance of TargetResource', () => {
        expect(result).to.be.an.instanceof(TargetResource);
      });

      it(`should fire event "${ResourcePoolEvents.RESOURCE_ADDED}"`, () => {
        expect(listener).to.be.calledOnce;
      });

      it('should fire event with resource target data', () => {
        const data = listener.getCall(0).args[0].data;
        expect(data).to.be.equal(result);
      });

      describe('When adding with custom type', () => {
        let target;
        let type;
        let resource;

        beforeEach(() => {
          target = {};
          type = 'target-type';
          resource = pool.set(target, type);
        });

        it('should keep custom target type', () => {
          expect(resource.type).to.be.equal(type);
        });
      });

      describe('When adding already existing', () => {
        let nextResult;

        beforeEach(() => {
          listener.reset();
          nextResult = pool.set(target);
        });

        it('should return same TargetResource instance', () => {
          expect(nextResult).to.be.equal(result);
        });

        it(`should not fire event "${ResourcePoolEvents.RESOURCE_ADDED}"`, () => {
          expect(listener).to.not.be.called;
        });
      });

      describe('When adding Resource type', () => {
        it('should not store to pool RequestTarget', () => {
          expect(pool.set(__createRequestTarget())).to.be.null;
        });

        it('should not store to pool RequestTarget wrapped with Proxy', () => {
          expect(pool.set(__createRequestTargetProxy())).to.be.null;

        });

        it('should not store to pool TargetResource', () => {
          expect(pool.set(__createTargetResource())).to.be.null;
        });

        it('should not store to pool RAW resource', () => {
          const target = {};
          target[TARGET_DATA] = {};
          expect(pool.set(target)).to.be.null;
        });
      });
    });
  });

  describe('When looking for target', () => {
    it('should return true for added targets', () => {
      expect(pool.has(target1)).to.be.true;
      expect(pool.has(target2)).to.be.true;
    });

    it('should return false for unknown targets', () => {
      expect(pool.has({})).to.be.false;
      expect(pool.has('1111')).to.be.false;
    });
  });

  describe('When requesting target', () => {
    it('should return proper resource object by target', () => {
      expect(pool.get(target1)).to.be.equal(resource1);
      expect(pool.get(target2)).to.be.equal(resource2);
    });

    it('should return proper resource object by id', () => {
      expect(pool.get(resource1.id)).to.be.equal(resource1);
      expect(pool.get(resource2.id)).to.be.equal(resource2);
    });

    describe('When looking for non-existent target', () => {
      it('should return `undefined` for not found targets', () => {
        expect(pool.get({})).to.be.undefined;
      });
    });
  });

  describe('When removing target', () => {
    let listener;
    let active;

    beforeEach(() => {
      active = undefined;
      listener = sandbox.spy((event) => {
        active = event.data.active;
      });
      pool.addEventListener(ResourcePoolEvents.RESOURCE_REMOVED, listener);
      sandbox.spy(resource1, 'destroy');
      pool.remove(target1);
    });

    afterEach(() => {
      resource1.destroy.restore();
    });

    it('removed target should be excluded from pool', () => {
      expect(pool.has(target1)).to.be.false;
      expect(pool.has(target2)).to.be.true;
    });

    it(`should fire event "${ResourcePoolEvents.RESOURCE_REMOVED}"`, () => {
      expect(listener).to.be.calledOnce;
    });

    it('should fire event with resource as event data', () => {
      const data = listener.getCall(0).args[0].data;
      expect(data).to.be.equal(resource1);
    });

    it('resource should be active when event fired', () => {
      expect(active).to.be.true;
    });

    it('resource should be destroyed immediately after event fired', () => {
      expect(resource1.active).to.be.false;
    });
  });

  describe('When clearing pool', () => {
    let beforeListener;
    let afterListener;
    let beforeActive;
    let beforeExists;
    let afterActive;
    let afterExists;

    beforeEach(() => {
      beforeListener = sandbox.spy(() => {
        beforeActive = resource1.active;
        beforeExists = pool.has(target2);
      });
      afterListener = sandbox.spy(() => {
        afterActive = resource2.active;
        afterExists = pool.has(target1);
      });
      pool.addEventListener(ResourcePoolEvents.POOL_CLEAR, beforeListener);
      pool.addEventListener(ResourcePoolEvents.POOL_CLEARED, afterListener);
      pool.clear();
    });

    it(`should fire "${ResourcePoolEvents.POOL_CLEAR}" event`, () => {
      expect(beforeListener).to.be.calledOnce;
    });

    it(`"${ResourcePoolEvents.POOL_CLEAR}" event should target to own pool`, () => {
      expect(beforeListener.getCall(0).args[0].data).to.be.equal(pool);
    });

    it(`should fire "${ResourcePoolEvents.POOL_CLEAR}" event before destroying resources`, () => {
      expect(beforeActive).to.be.true;
      expect(beforeExists).to.be.true;
    });

    it(`should fire "${ResourcePoolEvents.POOL_CLEARED}" event`, () => {
      expect(beforeListener).to.be.calledOnce;
    });

    it(`"${ResourcePoolEvents.POOL_CLEARED}" event should target to own pool`, () => {
      expect(afterListener.getCall(0).args[0].data).to.be.equal(pool);
    });

    it(`should fire "${ResourcePoolEvents.POOL_CLEARED}" event after resources destroyed`, () => {
      expect(afterActive).to.be.false;
      expect(afterExists).to.be.false;
    });

    it('should fire events in order', () => {
      sinon.assert.callOrder(beforeListener, afterListener);
    });

    it('should exclude targets', () => {
      expect(pool.has(target1)).to.be.false;
      expect(pool.has(target2)).to.be.false;
    });

    it('should destroy resources', () => {
      expect(resource1.active).to.be.false;
      expect(resource2.active).to.be.false;
    });

    it('should allow re-adding same targets', () => {
      expect(pool.set(target1)).to.not.be.equal(resource1);
      expect(pool.set(target2)).to.not.be.equal(resource2);
    });
  });

  describe('When destroying pool', () => {
    let clearedListener;
    let destroyedListener;

    beforeEach(() => {
      clearedListener = sandbox.spy();
      destroyedListener = sandbox.spy();
      sandbox.spy(pool, 'clear');
      pool.addEventListener(ResourcePoolEvents.POOL_CLEARED, clearedListener);
      pool.addEventListener(ResourcePoolEvents.POOL_DESTROYED, destroyedListener);
      pool.destroy();
    });

    it('should become inactive', () => {
      expect(pool.isActive()).to.be.false;
    });

    it('should clear() pool', () => {
      expect(pool.clear).to.be.calledOnce;
    });

    it(`should fire "${ResourcePoolEvents.POOL_DESTROYED}" event`, () => {
      expect(destroyedListener).to.be.calledOnce;
    });

    it('should fire events in order', () => {
      sinon.assert.callOrder(clearedListener, destroyedListener);
    });

    describe('When trying to use destroyed pool', () => {
      it('should cause error', () => {
        expect(() => {
          pool.set({});
        }).to.throw(Error);
      });
    });
  });

  describe('isValidTarget()', () => {
    beforeEach(() => {
      setValidTargets(['object']);
    });

    afterEach(() => {
      setValidTargets(getDefaultValidTargets());
    });

    it('should say valid for stored target types', () => {
      expect(isValidTarget({})).to.be.true;
      expect(isValidTarget(() => {
      })).to.be.false;
    });

    it('should say valid even if its value falsy', () => {
      expect(isValidTarget(null)).to.be.true;
    });
  });

  describe('setValidTargets()', () => {
    beforeEach(() => {
      setValidTargets([]);
    });

    afterEach(() => {
      setValidTargets(getDefaultValidTargets());
    });

    it('should apply passed list of targets', () => {
      expect(isValidTarget({})).to.be.false;
      setValidTargets(['object']);
      expect(isValidTarget({})).to.be.true;
      expect(isValidTarget(() => {
      })).to.be.false;
      setValidTargets(['function']);
      expect(isValidTarget({})).to.be.false;
      expect(isValidTarget(() => {
      })).to.be.true;
    });
  });

  describe('getDefaultValidTargets()', () => {
    it('should contain list of strings', () => {
      expect(getDefaultValidTargets()).to.be.an.instanceof(Array);
      expect(getDefaultValidTargets()[0]).to.be.a('string');
    });
  });

  describe('create()', () => {
    it('should return an instance of ResourcePool', () => {
      expect(createResourcePool()).to.be.an.instanceof(ResourcePool);
    });
  });
});
