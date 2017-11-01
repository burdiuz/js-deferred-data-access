import IConvertible from './IConvertible';
import isResourceConvertible from './isResourceConvertible';
import {
  __createDataResolvedPromise,
  __createTargetResource,
  __createRequestTarget,
  __createRequestTargetData,
  __createRequestTargetProxy,
} from '../../tests/stubs';

describe('isResourceConvertible()', () => {
  it('should return true for TargetResource', () => {
    expect(isResourceConvertible(__createTargetResource())).to.be.true;
  });

  it('should return true for RequestTarget', () => {
    expect(isResourceConvertible(__createRequestTarget())).to.be.true;
  });

  it('should return true for RequestTarget wrapped into Proxy', () => {
    expect(isResourceConvertible(__createRequestTargetProxy(__createDataResolvedPromise())))
      .to.be.true;
  });

  it('should return true for RAW resource', () => {
    expect(isResourceConvertible(__createRequestTargetData())).to.be.true;
  });

  it('should return true for IConvertible instance', () => {
    expect(isResourceConvertible(new IConvertible())).to.be.true;
  });

  it('should return true for function', () => {
    expect(isResourceConvertible(() => {
    })).to.be.true;
  });
});
