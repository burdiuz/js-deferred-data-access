import TARGET_INTERNALS from './TARGET_INTERNALS';
import areSameResource from './areSameResource';
import { __createRequest, __createResource } from '../../tests/stubs';

describe('areSameResource()', () => {
  let child1;
  let child2;

  describe('When resource provided', () => {
    beforeEach(() => {
      child1 = __createResource();
      child2 = __createResource();
    });

    describe('When same instance compared', () => {
      beforeEach(() => {

      });
    });

    describe('When diff instances compared', () => {

      beforeEach(() => {

      });
    });

    describe('When diff resources compared', () => {
      beforeEach(() => {

      });
    });
  });

  describe('When request provided', () => {
    beforeEach(() => {
      child1 = __createRequest();
      child2 = __createRequest();
    });

    describe('When same instance compared', () => {
      beforeEach(() => {

      });
    });

    describe('When diff instances compared', () => {
      beforeEach(() => {

      });
    });

    describe('When diff requests compared', () => {
      beforeEach(() => {

      });
    });
  });

  describe('When resource and request provided', () => {
    beforeEach(() => {
      child1 = __createResource();
      child2 = __createRequest();
    });

    describe('When same resource compared', () => {
      beforeEach(() => {

      });
    });

    describe('When diff resources compared', () => {
      beforeEach(() => {

      });
    });
  });

  describe('When not resource provided', () => {
    beforeEach(() => {
      child1 = __createResource();
    });

    it('should result in FALSE', () => {
      expect(child1, {});
      expect(child1, { [TARGET_INTERNALS]: {} }).to.be.false;
      expect(child1, { [TARGET_INTERNALS]: {} }).to.be.false;
    });
  });
});
