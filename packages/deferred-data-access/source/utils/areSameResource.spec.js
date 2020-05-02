import TARGET_INTERNALS from './TARGET_INTERNALS';
import areSameResource from './areSameResource';
import { __createRequest, __createResource, __createResourceData } from '../../tests/stubs';
import TARGET_DATA from "./TARGET_DATA";

describe('areSameResource()', () => {
  let child1;
  let child2;

  describe('When resource provided', () => {
    beforeEach(() => {
      child1 = __createResource();
    });

    describe('When same instance compared', () => {
      it('should result in TRUE', () => {
        expect(areSameResource(child1, child1)).to.be.true;
      });
    });

    describe('When diff instances compared', () => {
      it('should result in TRUE', () => {
        expect(areSameResource(child1, __createResource())).to.be.true;
        expect(areSameResource(child1, __createResourceData())).to.be.true;
      });
    });

    describe('When diff resources compared', () => {
      it('should result in FALSE', () => {
        expect(areSameResource(child1, __createResource(null, { id: 1234 }))).to.be.false;
        expect(areSameResource(child1, __createResource(null, undefined, undefined, '1234'))).to.be.false;
        expect(areSameResource(child1, __createResourceData({ $id: '1234' }))).to.be.false;
        expect(areSameResource(child1, __createResourceData({ $poolId: '1234' }))).to.be.false;
      });
    });
  });

  describe('When request provided', () => {
    beforeEach(() => {
      child1 = __createRequest();
      child2 = __createRequest();
    });

    it('should result in FALSE for pending requests', () => {
      expect(areSameResource(child1, child2)).to.be.false;
    });

    it('should result in FALSE for pending request, same instance', () => {
      expect(areSameResource(child1, child1)).to.be.false;
      expect(areSameResource(child2, child2)).to.be.false;
    });

    describe('When requests are resolved', () => {
      beforeEach(() => Promise.all([child1, child2]));

      it('should result in TRUE for resolved requests', () => {
        expect(areSameResource(child1, child2)).to.be.true;
      });

      it('should result in TRUE for resolved request, same instance', () => {
        expect(areSameResource(child1, child1)).to.be.true;
      });
    });
  });

  describe('When resource and request provided', () => {
    let id;
    let poolId;

    beforeEach(() => {
      id = '1234';
      poolId = '4321';
      child1 = __createRequest(undefined, { $id: id, $poolId: poolId });
    });

    describe('When request is pending', () => {
      let child3;
      describe('When same resource', () => {
        beforeEach(() => {
          child2 = __createResource({}, { id: poolId }, undefined, id);
          child3 = __createResourceData({ $poolId: poolId, $id: id });
        });

        it('should result with FALSE', () => {
          expect(areSameResource(child1, child2)).to.be.false;
          expect(areSameResource(child1, child3)).to.be.false;
        });
      });

      describe('When different resources', () => {
        it('should result with FALSE', () => {
          expect(areSameResource(child1, __createResource({}, undefined, undefined, '458766'))).to.be.false;
          expect(areSameResource(child1, __createResource({}, { id: '121345466' }))).to.be.false;
          expect(areSameResource(child1, __createResourceData({ $poolId: poolId, $id: '1245457687' }))).to.be.false;
          expect(areSameResource(child1, __createResourceData({ $poolId: '876543', $id: id }))).to.be.false;
        });
      });
    });

    describe('When request is resolved', () => {
      beforeEach(() => child1);

      describe('When same resource', () => {
        beforeEach(() => {
          child2 = __createResource({}, { id: poolId }, undefined, id);
        });

        it('should result with TRUE', () => {
          expect(areSameResource(child1, child2)).to.be.true;
        });
      });

      describe('When different resources', () => {
        it('should result with FALSE', () => {
          expect(areSameResource(child1, __createResource({}, undefined, undefined, '458766'))).to.be.false;
          expect(areSameResource(child1, __createResource({}, { id: '121345466' }))).to.be.false;
        });
      });
    });
  });

  describe('When not resource provided', () => {
    beforeEach(() => {
      child1 = __createResource();
    });

    it('should result in FALSE', () => {
      expect(areSameResource(child1, {})).to.be.false;
      expect(areSameResource(child1, { [TARGET_INTERNALS]: { isResource: () => false } })).to.be.false;
      expect(areSameResource(child1, { [TARGET_DATA]: { $id: '123', $poolId: '321' } })).to.be.false;
    });
  });
});
