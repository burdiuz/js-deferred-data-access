import isResource from './isResource';
import {
  __createDataResolvedPromise,
  __createRequest,
  __createResource,
  __createRequestData,
  __createRequestProxy,
} from '../../tests/stubs';

describe('isResource()', () => {
  describe('When using Resource', () => {
    it('should return true for Resource', () => {
      expect(isResource(__createResource())).to.be.true;
    });
  });

  describe('When using request Target', () => {
    let target;

    describe('When using proxies', () => {
      beforeEach(() => {
        target = __createRequest();
      });

      it('should return false for unresolved Target', () => {
        expect(isResource(target)).to.be.false;
      });

      it('should return true for unresolved Target', () => target
        .then(() => {
          expect(isResource(target)).to.be.true;
        })
      );
    });

    describe('When not using proxies', () => {
      beforeEach(() => {
        target = __createRequestProxy(__createDataResolvedPromise());
      });

      it('should return false for unresolved Target', () => {
        expect(isResource(target)).to.be.false;
      });

      it('should return true for unresolved Target', () => target
        .then(() => {
          expect(isResource(target)).to.be.true;
        })
      );
    });
  });

  describe('When using raw object', () => {
    it('should return true for RAW resource', () => {
      expect(isResource(__createRequestData())).to.be.true;
    });
  });
});
