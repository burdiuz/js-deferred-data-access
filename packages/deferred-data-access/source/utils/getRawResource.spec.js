import TARGET_DATA from './TARGET_DATA';
import getRawResource from './getRawResource';
import IConvertible from './IConvertible';
import {
  defaultResourcePool,
  createResourcePool,
} from '../resource/ResourcePool';
import {
  __createDataResolvedPromise,
  __createRequest,
  __createResource,
  __createRequestData,
  __createRequestProxy,
} from '../../tests/stubs';

describe('getRawResource()', () => {
  let data;
  let pool;

  after(() => {
    defaultResourcePool.clear();
  });

  const shouldResultInProperRAWData = () => {
    it('should result in proper RAW data', () => {
      expect(data[TARGET_DATA].$id).to.be.a('string');
      expect(data[TARGET_DATA].$type).to.be.a('string');
      expect(data[TARGET_DATA].$poolId).to.be.a('string');
    });
  };

  it('should result into raw resource data from Resource', () => {
    const resource = __createResource();

    expect(getRawResource(resource)).to.be.eql({
      [TARGET_DATA]: {
        $id: resource.id,
        $type: resource.type,
        $poolId: resource.poolId,
      },
    });
  });

  it('should result into RAW resource data from Target', () => {
    const resource = __createRequest(__createDataResolvedPromise());

    return resource.then(() => {
      expect(getRawResource(resource)).to.be.eql(__createRequestData());
    });
  });

  it('should result into RAW resource data from Target wrapped into Proxy', () => {
    const promise = __createDataResolvedPromise();
    const resource = __createRequestProxy();

    return promise.then(() => {
      expect(getRawResource(resource)).to.be.eql(__createRequestData());
    });
  });

  it('should result into RAW resource data from RAW resource data', () => {
    data = {
      [TARGET_DATA]: {
        $id: '12345',
        $type: 'resource.type',
        $poolId: '54321',
      },
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
      beforeEach(() => {
        pool = createResourcePool();
        data = getRawResource(target, pool);
      });

      shouldResultInProperRAWData();

      it('should register target in passed ResourcePool', () => {
        expect(pool.has(target)).to.be.true;
      });

      it('should not register target in default ResourcePool', () => {
        expect(defaultResourcePool.has(target)).to.be.false;
      });
    });

    describe('When passed without ResourcePool', () => {
      beforeEach(() => {
        data = getRawResource(target);
      });

      shouldResultInProperRAWData();

      it('should register target in default ResourcePool', () => {
        expect(defaultResourcePool.has(target)).to.be.true;
      });
    });
  });

  describe('When Function passed', () => {
    let target;

    beforeEach(() => {
      target = () => null;
    });

    describe('When passed with ResourcePool', () => {
      beforeEach(() => {
        pool = createResourcePool();
        data = getRawResource(target, pool);
      });

      shouldResultInProperRAWData();

      it('should register target in passed ResourcePool', () => {
        expect(pool.has(target)).to.be.true;
      });

      it('should not register target in default ResourcePool', () => {
        expect(defaultResourcePool.has(target)).to.be.false;
      });
    });

    describe('When passed without ResourcePool', () => {
      beforeEach(() => {
        data = getRawResource(target);
      });

      shouldResultInProperRAWData();

      it('should register target in default ResourcePool', () => {
        expect(defaultResourcePool.has(target)).to.be.true;
      });
    });
  });
});
