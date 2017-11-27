import IConvertible from './IConvertible';
import isResourceConvertible from './isResourceConvertible';
import {
  __createDataResolvedPromise,
  __createResource,
  __createRequest,
  __createRequestData,
  __createRequestProxy,
} from '../../tests/stubs';

describe('isResourceConvertible()', () => {
  it('should return true for Resource', () => {
    expect(isResourceConvertible(__createResource())).to.be.true;
  });

  it('should return true for Target', () => {
    expect(isResourceConvertible(__createRequest())).to.be.true;
  });

  it('should return true for Target wrapped into Proxy', () => {
    expect(isResourceConvertible(__createRequestProxy(__createDataResolvedPromise())))
      .to.be.true;
  });

  it('should return true for RAW resource', () => {
    expect(isResourceConvertible(__createRequestData())).to.be.true;
  });

  it('should return true for IConvertible instance', () => {
    expect(isResourceConvertible(new IConvertible())).to.be.true;
  });

  it('should return true for function', () => {
    expect(isResourceConvertible(() => null)).to.be.true;
  });
});
