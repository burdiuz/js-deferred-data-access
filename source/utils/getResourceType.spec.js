import TARGET_DATA from './TARGET_DATA';
import getResourceType from './getResourceType';
import {
  __createDataResolvedPromise,
  __createRequestTarget,
  __createTargetResource,
  __createRequestTargetData,
  __createRequestTargetProxy,
} from '../../tests/stubs';

describe('getResourceType()', () => {
  it('should return type for RequestTarget', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTarget(promise);
    return promise.then(() => {
      expect(getResourceType(resource))
        .to.be.equal(__createRequestTargetData()[TARGET_DATA].type);
    });
  });

  it('should return type for RequestTarget wrapped with Proxy', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTargetProxy();
    promise.then(() => {
      expect(getResourceType(resource))
        .to.be.equal(__createRequestTargetData()[TARGET_DATA].type);
    });
  });

  it('should return type for TargetResource', () => {
    const resource = __createTargetResource();
    expect(getResourceType(resource)).to.be.equal(resource.type);
  });

  it('should return type for RAW resource', () => {
    const resource = __createRequestTargetData();
    expect(getResourceType(resource)).to.be.equal(resource[TARGET_DATA].type);
  });

  it('should return null if data is not a resource', () => {
    expect(getResourceType({})).to.be.null;
  });
});
