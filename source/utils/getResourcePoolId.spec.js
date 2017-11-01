import TARGET_DATA from './TARGET_DATA';
import getResourcePoolId from './getResourcePoolId';
import {
  __createDataResolvedPromise,
  __createRequestTarget,
  __createTargetResource,
  __createRequestTargetData,
  __createRequestTargetProxy,
} from '../../tests/stubs';

describe('getResourcePoolId()', () => {
  it('should return poolId for RequestTarget', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTarget(promise);
    return promise.then(() => {
      expect(getResourcePoolId(resource))
        .to.be.equal(__createRequestTargetData()[TARGET_DATA].poolId);
    });
  });

  it('should return poolId for RequestTarget wrapped with Proxy', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTargetProxy();
    return promise.then(() => {
      expect(getResourcePoolId(resource))
        .to.be.equal(__createRequestTargetData()[TARGET_DATA].poolId);
    });
  });

  it('should return poolId for TargetResource', () => {
    const resource = __createTargetResource();
    expect(getResourcePoolId(resource)).to.be.equal(resource.poolId);
  });

  it('should return poolId for RAW resource', () => {
    const resource = __createRequestTargetData();
    expect(getResourcePoolId(resource)).to.be.equal(resource[TARGET_DATA].poolId);
  });

  it('should return null if data is not a resource', () => {
    expect(getResourcePoolId({})).to.be.null;
  });
});
