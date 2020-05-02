import RAW_RESOURCE_DATA_KEY from './RAW_RESOURCE_DATA_KEY';
import getResourcePoolId from './getResourcePoolId';
import {
  __createDataResolvedPromise,
  __createRequest,
  __createResource,
  __createRequestData,
  __createRequestProxy,
} from '../../tests/stubs';

describe('getResourcePoolId()', () => {
  it('should return poolId for Target', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequest(promise);
    return promise.then(() => {
      expect(getResourcePoolId(resource))
        .to.be.equal(__createRequestData()[RAW_RESOURCE_DATA_KEY].$poolId);
    });
  });

  it('should return poolId for Target wrapped with Proxy', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestProxy();
    return promise.then(() => {
      expect(getResourcePoolId(resource))
        .to.be.equal(__createRequestData()[RAW_RESOURCE_DATA_KEY].$poolId);
    });
  });

  it('should return poolId for Resource', () => {
    const resource = __createResource();
    expect(getResourcePoolId(resource)).to.be.equal(resource.poolId);
  });

  it('should return poolId for RAW resource', () => {
    const resource = __createRequestData();
    expect(getResourcePoolId(resource)).to.be.equal(resource[RAW_RESOURCE_DATA_KEY].$poolId);
  });

  it('should return null if data is not a resource', () => {
    expect(getResourcePoolId({})).to.be.null;
  });
});
