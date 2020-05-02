import IConvertible from './IConvertible';
import isResourceConvertible from './isResourceConvertible';
import {
  __createDataResolvedPromise,
  __createResource,
  __createRequest,
  __createRequestData,
  __createRequestProxy,
} from '../../tests/stubs';

describe('isResourceConvertible()', () => {
  describe('When Resource used', () => {
    it('should return true for Resource', () => {
      expect(isResourceConvertible(__createResource())).to.be.true;
    });
  });

  describe('When using request Target', () => {
    let target;

    describe('When using proxies', () => {
      beforeEach(() => {
        target = __createRequest();
      });

      it('should return true for unresolved Target', () => {
        expect(isResourceConvertible(target)).to.be.true;
      });

      it('should return true for unresolved Target', () => target
        .then(() => {
          expect(isResourceConvertible(target)).to.be.true;
        })
      );
    });

    describe('When not using proxies', () => {
      beforeEach(() => {
        target = __createRequestProxy(__createDataResolvedPromise());
      });

      it('should return true for unresolved Target', () => {
        expect(isResourceConvertible(target)).to.be.true;
      });

      it('should return true for unresolved Target', () => target
        .then(() => {
          expect(isResourceConvertible(target)).to.be.true;
        })
      );
    });
  });

  it('should return true for RAW resource', () => {
    expect(isResourceConvertible(__createRequestData())).to.be.true;
  });

  it('should return true for IConvertible instance', () => {
    expect(isResourceConvertible(new IConvertible())).to.be.true;
  });

  it('should return true for function', () => {
    expect(isResourceConvertible(() => null)).to.be.true;
  });
});
