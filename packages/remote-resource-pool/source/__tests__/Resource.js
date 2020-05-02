import RAW_RESOURCE_DATA_KEY from '../utils/RAW_RESOURCE_DATA_KEY';
import Resource, { createResource } from '../Resource';

describe('Resource', () => {
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
    resource = new Resource(pool, target, targetType, resourceId);
  });

  describe('When created', () => {
    it('should have ID string', () => {
      expect(resource.id).to.be.equal(resourceId);
    });
    it('should have pool ID', () => {
      expect(resource.poolId).to.be.equal(pool.id);
    });
    it('should have resource linked', () => {
      expect(resource.value).to.be.equal(target);
    });
    it('should have active = true', () => {
      expect(resource.active).to.be.true;
    });
    it('should have "type" to be passed type', () => {
      expect(resource.type).to.be.equal(targetType);
    });

    describe('When resource type not specified', () => {
      beforeEach(() => {
        resource = new Resource(pool, target, null, resourceId);
      });
      it('should have "type" to be target type', () => {
        expect(resource.type).to.be.equal(typeof (target));
      });
    });
  });

  // INFO reusing same cases for RAW_RESOURCE_DATA_KEY and for toJSON() testing, since they are aliases
  function rawDataCases(data) {
    it('should be RAW object', () => {
      expect(data().constructor).to.be.equal(Object);
    });

    it('should contain target data', () => {
      expect(data()[RAW_RESOURCE_DATA_KEY].constructor).to.be.equal(Object);
    });

    it('should contain resource IDs', () => {
      expect(data()[RAW_RESOURCE_DATA_KEY].$id).to.be.equal(resource.id);
      expect(data()[RAW_RESOURCE_DATA_KEY].$poolId).to.be.equal(pool.id);
    });

    it('should contain target type', () => {
      expect(data()[RAW_RESOURCE_DATA_KEY].$type).to.be.equal(targetType);
    });
  }

  describe('When RAW_RESOURCE_DATA_KEY requested', () => {
    let data;
    beforeEach(() => {
      data = resource[RAW_RESOURCE_DATA_KEY];
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
      expect(resource.value).to.not.be.ok;
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
    it('should create new instance of Resource', () => {
      const resource = createResource(pool, target, null, '11111');
      expect(resource).to.be.an.instanceof(Resource);
      expect(resource.id).to.be.equal('11111');
    });
    it('should generate ID if not passed', () => {
      const { id } = createResource(pool, target);
      expect(id).to.be.a('string');
      expect(id).to.not.be.empty;
    });
  });
});
