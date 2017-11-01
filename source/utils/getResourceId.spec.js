import TARGET_DATA from './TARGET_DATA';
import getResourceId from './getResourceId';
import {
  __createDataResolvedPromise,
  __createRequestTarget,
  __createTargetResource,
  __createRequestTargetData,
  __createRequestTargetProxy,
} from '../../tests/stubs';

describe('getResourceId()', () => {
  it('should return ID for RequestTarget', () => {
    const resource = __createRequestTarget(__createDataResolvedPromise());
    return resource.then(() => {
      expect(getResourceId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].id);
    });
  });

  it('should return ID for RequestTarget wrapped with Proxy', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTargetProxy();
    return promise.then(() => {
      expect(getResourceId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].id);
    });
  });

  it('should return ID for TargetResource', () => {
    const resource = __createTargetResource();
    expect(getResourceId(resource)).to.be.equal(resource.id);
  });

  it('should return ID for RAW resource', () => {
    const resource = __createRequestTargetData();
    expect(getResourceId(resource)).to.be.equal(resource[TARGET_DATA].id);
  });

  it('should return null if data is not a resource', () => {
    expect(getResourceId({})).to.be.null;
  });
});
