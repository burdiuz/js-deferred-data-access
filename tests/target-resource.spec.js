/**
 * Created by Oleg Galaburda on 10.03.16.
 */
describe('TargetResource', function() {
  var resource, pool, target, targetType, id;
  beforeEach(function() {
    pool = {
      id: 'le pool',
      remove: sinon.spy()
    };
    target = {};
    targetType = 'target-type';
    id = 'das ID';
    resource = new TargetResource(pool, target, targetType, id);
  });

  describe('When created', function() {
    it('should have ID string', function() {
      expect(resource.id).to.be.equal(id);
    });
    it('should have pool ID', function() {
      expect(resource.poolId).to.be.equal(pool.id);
    });
    it('should have resource linked', function() {
      expect(resource.resource).to.be.equal(target);
    });
    it('should have active = true', function() {
      expect(resource.active).to.be.true;
    });
    it('should have "type" to be passed type', function() {
      expect(resource.type).to.be.equal(targetType);
    });

    describe('When resource type not specified', function() {
      beforeEach(function() {
        resource = new TargetResource(pool, target, null, id);
      });
      it('should have "type" to be target type', function() {
        expect(resource.type).to.be.equal(typeof(target));
      });
    });
  });

  //INFO reusing same cases for TARGET_DATA and for toJSON() testing, since they are aliases
  function rawDataCases(data) {
    it('should be RAW object', function() {
      expect(data().constructor).to.be.equal(Object);
    });
    it('should contain target data', function() {
      expect(data()[TARGET_DATA].constructor).to.be.equal(Object);
    });
    it('should contain resource IDs', function() {
      expect(data()[TARGET_DATA].id).to.be.equal(resource.id);
      expect(data()[TARGET_DATA].poolId).to.be.equal(pool.id);
    });
    it('should contain target type', function() {
      expect(data()[TARGET_DATA].type).to.be.equal(targetType);
    });
  }

  describe('When TARGET_DATA requested', function() {
    var data;
    beforeEach(function() {
      data = resource[TARGET_DATA];
    });
    rawDataCases(function() {
      return data;
    });
  });

  describe('toJSON()', function() {
    var jsonObject;
    beforeEach(function() {
      jsonObject = resource.toJSON();
    });
    rawDataCases(function() {
      return jsonObject;
    });
  });

  describe('destroy()', function() {
    beforeEach(function() {
      resource.destroy();
    });
    it('should clear references', function() {
      expect(resource.id).to.not.be.ok;
      expect(resource.poolId).to.not.be.ok;
      expect(resource.resource).to.not.be.ok;
    });
    it('should change active to false', function() {
      expect(resource.active).to.be.false;
    });
    it('should remove itself from owner TargetPool', function() {
      expect(pool.remove).to.be.calledOnce;
    });

    describe('When destroy() called again', function() {
      beforeEach(function() {
        resource.destroy();
      });
      it('should keep active on false', function() {
        expect(resource.active).to.be.false;
      });
      it('should not call TargetPool.remove()', function() {
        expect(pool.remove).to.be.calledOnce;
      });
    });
  });

  describe('create()', function() {
    it('should create new instance of TargetResource', function() {
      var resource = TargetResource.create(pool, target, null, '11111');
      expect(resource).to.be.an.instanceof(TargetResource);
      expect(resource.id).to.be.equal('11111');
    });
    it('should generate ID if not passed', function() {
      var id = TargetResource.create(pool, target).id;
      expect(id).to.be.a('string');
      expect(id).to.not.be.empty;
    });
  });
});
