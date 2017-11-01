import TARGET_DATA from './TARGET_DATA';
import getResourceData from './getResourceData';
import {
  __createDataResolvedPromise,
  __createRequestTarget,
  __createTargetResource,
  __createRequestTargetData,
  __createRequestTargetProxy,
} from '../../tests/stubs';

describe('getResourceData()', () => {
  it('should return raw data for RequestTarget', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTarget(promise);
    return promise.then(() => {
      expect(getResourceData(resource)).to.be.eql(__createRequestTargetData()[TARGET_DATA]);
    });
  });

  it('should return raw data for RequestTarget wrapped with Proxy', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTargetProxy();
    return promise.then(() => {
      expect(getResourceData(resource)).to.be.eql(__createRequestTargetData()[TARGET_DATA]);
    });
  });

  it('should return raw data for TargetResource', () => {
    const resource = __createTargetResource();
    const data = {
      id: resource.id,
      type: resource.type,
      poolId: resource.poolId,
    };
    expect(getResourceData(resource)).to.be.eql(data);
  });

  it('should return raw data for RAW resource', () => {
    const resource = __createRequestTargetData();
    expect(getResourceData(resource)).to.be.eql(resource[TARGET_DATA]);
  });

  it('should return null if data is not a resource', () => {
    expect(getResourceData({})).to.be.null;
  });
});
