/**
 * Created by Oleg Galaburda on 03.03.16.
 */
describe('TargetPool', function() {
  /**
   * @type {TargetPool}
   */
  var pool;
  beforeEach(function() {
    pool = new TargetPool();
  });

  describe('When created', function() {
    it('should have own ID', function() {
      expect(pool.id).to.be.a('string');
    });
  });

  describe('When adding target', function() {
    var target = {}, result;

    describe('When adding new', function() {
      beforeEach(function() {
        result = pool.set(target);
      });
      it('should return instance of TargetResource', function() {
        expect(result).to.be.an.instanceof(TargetResource);
      });

      describe('When adding already existing', function() {
        var nextResult;
        beforeEach(function() {
          nextResult = pool.set(target);
        });
        it('should return same TargetResource instance', function() {
          expect(nextResult).to.be.equal(result);
        });
      });
    });
  });

  describe('When looking for target', function() {

  });

  describe('When requesting target', function() {

  });

  describe('When removing target', function() {

  });

  describe('isValidTarget()', function() {
    //FIXME tests may change static values and interfere with other tests
  });

  describe('setValidTargets()', function() {
  });

  describe('getDefaultValidTargets()', function() {
  });

  describe('create()', function() {
    it('should return an instance of TargetPool', function() {
      expect(TargetPool.create()).to.be.an.instanceof(TargetPool);
    });
  });
});
