import isResource from './isResource';
import {
  __createDataResolvedPromise,
  __createRequestTarget,
  __createTargetResource,
  __createRequestTargetData,
  __createRequestTargetProxy,
} from '../../tests/stubs';

describe('isResource()', () => {
  it('should return true for TargetResource', () => {
    expect(isResource(__createTargetResource())).to.be.true;
  });

  it('should return true for RequestTarget', () => {
    expect(isResource(__createRequestTarget())).to.be.true;
  });

  it('should return true for RequestTarget wrapped into Proxy', () => {
    expect(isResource(__createRequestTargetProxy(__createDataResolvedPromise()))).to.be.true;
  });

  it('should return true for RAW resource', () => {
    expect(isResource(__createRequestTargetData())).to.be.true;
  });
});
