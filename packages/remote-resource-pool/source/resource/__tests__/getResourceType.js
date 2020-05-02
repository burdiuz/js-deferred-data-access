import RAW_RESOURCE_DATA_KEY from './RAW_RESOURCE_DATA_KEY';
import getResourceType from './getResourceType';
import {
  __createDataResolvedPromise,
  __createRequest,
  __createResource,
  __createRequestData,
  __createRequestProxy,
} from '../../tests/stubs';

describe('getResourceType()', () => {
  it('should return type for Target', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequest(promise);
    return promise.then(() => {
      expect(getResourceType(resource))
        .to.be.equal(__createRequestData()[RAW_RESOURCE_DATA_KEY].$type);
    });
  });

  it('should return type for Target wrapped with Proxy', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestProxy();
    promise.then(() => {
      expect(getResourceType(resource))
        .to.be.equal(__createRequestData()[RAW_RESOURCE_DATA_KEY].$type);
    });
  });

  it('should return type for Resource', () => {
    const resource = __createResource();
    expect(getResourceType(resource)).to.be.equal(resource.type);
  });

  it('should return type for RAW resource', () => {
    const resource = __createRequestData();
    expect(getResourceType(resource)).to.be.equal(resource[RAW_RESOURCE_DATA_KEY].$type);
  });

  it('should return null if data is not a resource', () => {
    expect(getResourceType({})).to.be.null;
  });
});
