import TARGET_DATA from '../utils/TARGET_DATA';
import TargetResource, { createTargetResource } from './TargetResource';

describe('TargetResource', () => {
  let resource;
  let pool;
  let target;
  let targetType;
  let resourceId;
  beforeEach(() => {
    pool = {
      id: 'le pool',
      remove: sinon.spy(),
    };
    target = {};
    targetType = 'target-type';
    resourceId = 'das ID';
    resource = new TargetResource(pool, target, targetType, resourceId);
  });

  describe('When created', () => {
    it('should have ID string', () => {
      expect(resource.id).to.be.equal(resourceId);
    });
    it('should have pool ID', () => {
      expect(resource.poolId).to.be.equal(pool.id);
    });
    it('should have resource linked', () => {
      expect(resource.resource).to.be.equal(target);
    });
    it('should have active = true', () => {
      expect(resource.active).to.be.true;
    });
    it('should have "type" to be passed type', () => {
      expect(resource.type).to.be.equal(targetType);
    });

    describe('When resource type not specified', () => {
      beforeEach(() => {
        resource = new TargetResource(pool, target, null, resourceId);
      });
      it('should have "type" to be target type', () => {
        expect(resource.type).to.be.equal(typeof (target));
      });
    });
  });

  // INFO reusing same cases for TARGET_DATA and for toJSON() testing, since they are aliases
  function rawDataCases(data) {
    it('should be RAW object', () => {
      expect(data().constructor).to.be.equal(Object);
    });
    it('should contain target data', () => {
      expect(data()[TARGET_DATA].constructor).to.be.equal(Object);
    });
    it('should contain resource IDs', () => {
      expect(data()[TARGET_DATA].id).to.be.equal(resource.id);
      expect(data()[TARGET_DATA].poolId).to.be.equal(pool.id);
    });
    it('should contain target type', () => {
      expect(data()[TARGET_DATA].type).to.be.equal(targetType);
    });
  }

  describe('When TARGET_DATA requested', () => {
    let data;
    beforeEach(() => {
      data = resource[TARGET_DATA];
    });
    rawDataCases(() => data);
  });

  describe('toJSON()', () => {
    let jsonObject;
    beforeEach(() => {
      jsonObject = resource.toJSON();
    });
    rawDataCases(() => jsonObject);
  });

  describe('destroy()', () => {
    beforeEach(() => {
      resource.destroy();
    });
    it('should clear references', () => {
      expect(resource.id).to.not.be.ok;
      expect(resource.poolId).to.not.be.ok;
      expect(resource.resource).to.not.be.ok;
    });
    it('should change active to false', () => {
      expect(resource.active).to.be.false;
    });
    it('should remove itself from owner ResourcePool', () => {
      expect(pool.remove).to.be.calledOnce;
    });

    describe('When destroy() called again', () => {
      beforeEach(() => {
        resource.destroy();
      });
      it('should keep active on false', () => {
        expect(resource.active).to.be.false;
      });
      it('should not call ResourcePool.remove()', () => {
        expect(pool.remove).to.be.calledOnce;
      });
    });
  });

  describe('create()', () => {
    it('should create new instance of TargetResource', () => {
      const resource = createTargetResource(pool, target, null, '11111');
      expect(resource).to.be.an.instanceof(TargetResource);
      expect(resource.id).to.be.equal('11111');
    });
    it('should generate ID if not passed', () => {
      const { id } = createTargetResource(pool, target);
      expect(id).to.be.a('string');
      expect(id).to.not.be.empty;
    });
  });
});
