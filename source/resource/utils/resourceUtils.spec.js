import { TARGET_DATA } from '../../utils';
import {
  getResourceType,
  getResourceData,
  getResourceId,
  getResourcePoolId,
  isResource,
  getRawResource,
} from './resourceUtils';
import IConvertible from './IConvertible';
import defaultResourcePool from './defaultResourcePool';
import ResourcePool from '../ResourcePool';
import ResourcePoolRegistry from '../ResourcePoolRegistry';
import {
  __createDataResolvedPromise,
  __createRequestTarget,
  __createRequestTargetData,
  __createRequestTargetProxy,
} from '../../../tests/stubs';

describe('getRawResource()', () => {
  after(() => {
    defaultResourcePool.clear();
  });

  it('should result into RAW resource data from TargetResource', () => {
    const resource = __createTargetResource();
    data = {};
    data[TARGET_DATA] = {
      id: resource.id,
      type: resource.type,
      poolId: resource.poolId,
    };
    expect(getRawResource(resource)).to.be.eql(data);
  });

  it('should result into RAW resource data from RequestTarget', (done) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTarget(promise);
    promise.then(() => {
      expect(getRawResource(resource)).to.be.eql(__createRequestTargetData());
      done();
    });
  });

  it('should result into RAW resource data from RequestTarget wrapped into Proxy', (data) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTargetProxy();
    promise.then(() => {
      expect(getRawResource(resource)).to.be.eql(__createRequestTargetData());
      data();
    });
  });

  it('should result into RAW resource data from RAW resource data', () => {
    const data = {};
    data[TARGET_DATA] = {
      id: '12345',
      type: 'resource.type',
      poolId: '54321',
    };
    expect(getRawResource(data)).to.be.equal(data);
  });

  it('should return null if data is not a resource', () => {
    expect(getRawResource({})).to.be.null;
  });

  describe('When IConvertible passed', () => {
    let target;

    beforeEach(() => {
      target = new IConvertible();
    });

    describe('When passed with ResourcePool', () => {
      let pool;
      let data;

      beforeEach(() => {
        pool = ResourcePool.create();
        data = getRawResource(target, pool);
      });

      it('should result in proper RAW data', () => {
        expect(data[TARGET_DATA].id).to.be.a('string');
        expect(data[TARGET_DATA].type).to.be.a('string');
        expect(data[TARGET_DATA].poolId).to.be.a('string');
      });

      it('should register target in passed ResourcePool', () => {
        expect(pool.has(target)).to.be.true;
      });

      it('should not register target in default ResourcePool', () => {
        expect(ResourcePoolRegistry.defaultResourcePool.has(target)).to.be.false;
      });
    });

    describe('When passed without ResourcePool', () => {
      let data;

      beforeEach(() => {
        data = getRawResource(target);
      });

      it('should result in proper RAW data', () => {
        expect(data[TARGET_DATA].id).to.be.a('string');
        expect(data[TARGET_DATA].type).to.be.a('string');
        expect(data[TARGET_DATA].poolId).to.be.a('string');
      });
      it('should register target in default ResourcePool', () => {
        expect(ResourcePoolRegistry.defaultResourcePool.has(target)).to.be.true;
      });
    });
  });

  describe('When Function passed', () => {
    let target;

    beforeEach(() => {
      target = () => {
      };
    });

    describe('When passed with ResourcePool', () => {
      let pool;
      let data;

      beforeEach(() => {
        pool = ResourcePool.create();
        data = getRawResource(target, pool);
      });

      it('should result in proper RAW data', () => {
        expect(data[TARGET_DATA].id).to.be.a('string');
        expect(data[TARGET_DATA].type).to.be.a('string');
        expect(data[TARGET_DATA].poolId).to.be.a('string');
      });

      it('should register target in passed ResourcePool', () => {
        expect(pool.has(target)).to.be.true;
      });

      it('should not register target in default ResourcePool', () => {
        expect(ResourcePoolRegistry.defaultResourcePool.has(target)).to.be.false;
      });
    });

    describe('When passed without ResourcePool', () => {
      let data;

      beforeEach(() => {
        data = getRawResource(target);
      });

      it('should result in proper RAW data', () => {
        expect(data[TARGET_DATA].id).to.be.a('string');
        expect(data[TARGET_DATA].type).to.be.a('string');
        expect(data[TARGET_DATA].poolId).to.be.a('string');
      });

      it('should register target in default ResourcePool', () => {
        expect(ResourcePoolRegistry.defaultResourcePool.has(target)).to.be.true;
      });
    });
  });
});

describe('getResourceData()', () => {
  it('should return raw data for RequestTarget', (done) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTarget(promise);
    promise.then(() => {
      expect(getResourceData(resource)).to.be.eql(__createRequestTargetData()[TARGET_DATA]);
      done();
    });
  });

  it('should return raw data for RequestTarget wrapped with Proxy', (data) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTargetProxy();
    promise.then(() => {
      expect(getResourceData(resource)).to.be.eql(__createRequestTargetData()[TARGET_DATA]);
      data();
    });
  });

  it('should return raw data for TargetResource', () => {
    const resource = __createTargetResource();
    data = {
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

describe('getResourceId()', () => {
  it('should return ID for RequestTarget', (done) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTarget(promise);
    promise.then(() => {
      expect(getResourceId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].id);
      done();
    });
  });

  it('should return ID for RequestTarget wrapped with Proxy', (data) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTargetProxy();
    promise.then(() => {
      expect(getResourceId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].id);
      data();
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

describe('getResourcePoolId()', () => {
  it('should return poolId for RequestTarget', (done) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTarget(promise);
    promise.then(() => {
      expect(getResourcePoolId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].poolId);
      done();
    });
  });

  it('should return poolId for RequestTarget wrapped with Proxy', (data) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTargetProxy();
    promise.then(() => {
      expect(getResourcePoolId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].poolId);
      data();
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

describe('getResourceType()', () => {
  it('should return type for RequestTarget', (done) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTarget(promise);
    promise.then(() => {
      expect(getResourceType(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].type);
      done();
    });
  });

  it('should return type for RequestTarget wrapped with Proxy', (data) => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestTargetProxy();
    promise.then(() => {
      expect(getResourceType(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].type);
      data();
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

describe('isResource()', () => {
  it('should return true for TargetResource', () => {
    expect(isResource(__createTargetResource())).to.be.true;
  });

  it('should return true for RequestTarget', () => {
    expect(isResource(__createRequestTarget())).to.be.true;
  });

  it('should return true for RequestTarget wrapped into Proxy', () => {
    expect(isResource(__createRequestTargetProxy(__createDataResolvedPromise()))).to.be.true;
  });

  it('should return true for RAW resource', () => {
    expect(isResource(__createRequestTargetData())).to.be.true;
  });
});
