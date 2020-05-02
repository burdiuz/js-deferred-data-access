import TARGET_DATA from './TARGET_DATA';
import getResourceData from './getResourceData';
import {
  __createDataResolvedPromise,
  __createRequest,
  __createResource,
  __createRequestData,
  __createRequestProxy,
} from '../../tests/stubs';

describe('getResourceData()', () => {
  it('should return raw data for Target', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequest(promise);
    return promise.then(() => {
      expect(getResourceData(resource)).to.be.eql(__createRequestData()[TARGET_DATA]);
    });
  });

  it('should return raw data for Target wrapped with Proxy', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestProxy();
    return promise.then(() => {
      expect(getResourceData(resource)).to.be.eql(__createRequestData()[TARGET_DATA]);
    });
  });

  it('should return raw data for Resource', () => {
    const resource = __createResource();
    const data = {
      $id: resource.id,
      $type: resource.type,
      $poolId: resource.poolId,
    };
    expect(getResourceData(resource)).to.be.eql(data);
  });

  it('should return raw data for RAW resource', () => {
    const resource = __createRequestData();
    expect(getResourceData(resource)).to.be.eql(resource[TARGET_DATA]);
  });

  it('should return null if data is not a resource', () => {
    expect(getResourceData({})).to.be.null;
  });
});
