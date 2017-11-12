import isResource from './isResource';
import {
  __createDataResolvedPromise,
  __createRequest,
  __createResource,
  __createRequestData,
  __createRequestProxy,
} from '../../tests/stubs';

describe('isResource()', () => {
  it('should return true for Resource', () => {
    expect(isResource(__createResource())).to.be.true;
  });

  it('should return true for Target', () => {
    expect(isResource(__createRequest())).to.be.true;
  });

  it('should return true for Target wrapped into Proxy', () => {
    expect(isResource(__createRequestProxy(__createDataResolvedPromise()))).to.be.true;
  });

  it('should return true for RAW resource', () => {
    expect(isResource(__createRequestData())).to.be.true;
  });
});
