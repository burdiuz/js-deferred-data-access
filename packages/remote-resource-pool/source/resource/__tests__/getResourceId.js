import RAW_RESOURCE_DATA_KEY from './RAW_RESOURCE_DATA_KEY';
import getResourceId from './getResourceId';
import {
  __createDataResolvedPromise,
  __createRequest,
  __createResource,
  __createRequestData,
  __createRequestProxy,
} from '../../tests/stubs';

describe('getResourceId()', () => {
  it('should return ID for Target', () => {
    const resource = __createRequest(__createDataResolvedPromise());
    return resource.then(() => {
      expect(getResourceId(resource)).to.be.equal(__createRequestData()[RAW_RESOURCE_DATA_KEY].$id);
    });
  });

  it('should return ID for Target wrapped with Proxy', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestProxy();
    return promise.then(() => {
      expect(getResourceId(resource)).to.be.equal(__createRequestData()[RAW_RESOURCE_DATA_KEY].$id);
    });
  });

  it('should return ID for Resource', () => {
    const resource = __createResource();
    expect(getResourceId(resource)).to.be.equal(resource.id);
  });

  it('should return ID for RAW resource', () => {
    const resource = __createRequestData();
    expect(getResourceId(resource)).to.be.equal(resource[RAW_RESOURCE_DATA_KEY].$id);
  });

  it('should return null if data is not a resource', () => {
    expect(getResourceId({})).to.be.null;
  });
});
