import {
  getId,
  createDeferred,
  areProxiesAvailable,
} from './utils';

describe('getId()', () => {
  it('Should return string', () => {
    expect(getId()).to.be.a.string;
  });
  it('Should return unique value', () => {
    expect(getId()).to.not.be.equal(getId());
    expect(getId()).to.not.be.equal(getId());
  });

});

describe('createDeferred()', () => {

  describe('When called', () => { // since its factory method
    let deferred;
    beforeEach(() => {
      deferred = createDeferred();
    });
    it('should create instance of Deferred object', () => {
      expect(deferred).to.be.an('object');
    });
    it('result should have handlers', () => {
      expect(deferred.resolve).to.be.a('function');
      expect(deferred.reject).to.be.a('function');
    });
    it('result should have promise', () => {
      expect(deferred.promise).to.be.an.instanceof(Promise);
    });

    describe('When deferred resolved', () => {
      beforeEach(() => {
        /**
         * 1. if promise never resolved this wil cause test fail because `done()` callback never called
         * 2. if promise resolved with RESOLVED, then we call `done()` without error
         * 3. if promise resolved with REJECTion, then we call `done()` with error text
         * stubs not needed
         */
        deferred.promise.then(() => {
          done();
        }, () => {
          done('Failure handler should be never called');
        });
        deferred.resolve('le data');
      });
    });

    describe('When deferred failed', () => {
      beforeEach((done) => {
        // promises resolved asynchronously
        deferred.promise.then(() => {
          done('Success handler should be never called');
        }, () => {
          done();
        });
        deferred.reject('le error');
      });
    });

  });
});

describe('areProxiesAvailable()', () => {
  let originalProxyConstructor;
  before(() => {
    originalProxyConstructor = window.Proxy;
    window.Proxy = null;
  });
  after(() => {
    window.Proxy = originalProxyConstructor;
  });
  it('should return true when proxies are available', () => {
    window.Proxy = () => {
    };
    expect(areProxiesAvailable()).to.be.true;
  });
  it('should return true when proxies are available', () => {
    window.Proxy = null;
    expect(areProxiesAvailable()).to.be.false;
  });
});
