describe('getId()', function() {
  it('Should return string', function() {
    expect(getId()).to.be.a.string;
  });
  it('Should return unique value', function() {
    expect(getId()).to.not.be.equal(getId());
    expect(getId()).to.not.be.equal(getId());
  });

});

describe('createDeferred()', function() {

  describe('When called', function() { //since its factory method
    var deferred;
    beforeEach(function() {
      deferred = createDeferred();
    });
    it('should create instance of Deferred object', function() {
      expect(deferred).to.be.an('object');
    });
    it('Deferred object should have "pending" status', function() {
      expect(deferred.status).to.be.equal(TargetStatus.PENDING);
    });
    it('result should have handlers', function() {
      expect(deferred.resolve).to.be.a('function');
      expect(deferred.reject).to.be.a('function');
    });
    it('result should have promise', function() {
      expect(deferred.promise).to.be.an.instanceof(Promise);
    });

    describe('When deferred resolved', function() {
      beforeEach(function() {
        /**
         * 1. if promise never resolved this wil cause test fail because `done()` callback never called
         * 2. if promise resolved with RESOLVED, then we call `done()` without error
         * 3. if promise resolved with REJECTion, then we call `done()` with error text
         * stubs not needed
         */
        deferred.promise.then(function() {
          done();
        }, function() {
          done('Failure handler should be never called');
        });
        deferred.resolve('le data');
      });
      it('Deferred object should change status to "resolved"', function() {
        expect(deferred.status).to.be.equal(TargetStatus.RESOLVED);
      });
    });

    describe('When deferred failed', function() {
      beforeEach(function(done) {
        // promises resolved asynchronously
        deferred.promise.then(function() {
          done('Success handler should be never called');
        }, function() {
          done();
        });
        deferred.reject('le error');
      });
      it('Deferred object should change status to "rejected"', function() {
        expect(deferred.status).to.be.equal(TargetStatus.REJECTED);
      });
    });

  });
});

describe('areProxiesAvailable()', function() {
  var originalProxyConstructor;
  before(function() {
    originalProxyConstructor = window.Proxy;
    window.Proxy = null;
  });
  after(function() {
    window.Proxy = originalProxyConstructor;
  });
  it('should return true when proxies are available', function() {
    window.Proxy = function() {
    };
    expect(areProxiesAvailable()).to.be.true;
  });
  it('should return true when proxies are available', function() {
    window.Proxy = null;
    expect(areProxiesAvailable()).to.be.false;
  });
});

describe('IConvertible()', function() {
  it('should be instantiable', function() {
    expect(new IConvertible()).to.be.an('object');
  });
});

describe('getRAWResource()', function() {

  after(function() {
    ResourcePoolRegistry.defaultResourcePool.clear();
  });

  it('should result into RAW resource data from TargetResource', function() {
    var resource = __createTargetResource();
    data = {};
    data[TARGET_DATA] = {
      id: resource.id,
      type: resource.type,
      poolId: resource.poolId
    };
    expect(getRAWResource(resource)).to.be.eql(data);
  });

  it('should result into RAW resource data from RequestTarget', function(done) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTarget(promise);
    promise.then(function() {
      expect(getRAWResource(resource)).to.be.eql(__createRequestTargetData());
      done();
    });
  });

  it('should result into RAW resource data from RequestTarget wrapped into Proxy', function(data) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTargetProxy();
    promise.then(function() {
      expect(getRAWResource(resource)).to.be.eql(__createRequestTargetData());
      data();
    });
  });

  it('should result into RAW resource data from RAW resource data', function() {
    var data = {};
    data[TARGET_DATA] = {
      id: '12345',
      type: 'resource.type',
      poolId: '54321'
    };
    expect(getRAWResource(data)).to.be.equal(data);
  });

  it('should return null if data is not a resource', function(){
    expect(getRAWResource({})).to.be.null;
  });

  describe('When IConvertible passed', function() {
    var target;
    beforeEach(function() {
      target = new IConvertible();
    });

    describe('When passed with ResourcePool', function() {
      var pool, data;
      beforeEach(function() {
        pool = ResourcePool.create();
        data = getRAWResource(target, pool);
      });
      it('should result in proper RAW data', function() {
        expect(data[TARGET_DATA].id).to.be.a('string');
        expect(data[TARGET_DATA].type).to.be.a('string');
        expect(data[TARGET_DATA].poolId).to.be.a('string');
      });
      it('should register target in passed ResourcePool', function() {
        expect(pool.has(target)).to.be.true;
      });
      it('should not register target in default ResourcePool', function() {
        expect(ResourcePoolRegistry.defaultResourcePool.has(target)).to.be.false;
      });
    });

    describe('When passed without ResourcePool', function() {
      var data;
      beforeEach(function() {
        data = getRAWResource(target);
      });
      it('should result in proper RAW data', function() {
        expect(data[TARGET_DATA].id).to.be.a('string');
        expect(data[TARGET_DATA].type).to.be.a('string');
        expect(data[TARGET_DATA].poolId).to.be.a('string');
      });
      it('should register target in default ResourcePool', function() {
        expect(ResourcePoolRegistry.defaultResourcePool.has(target)).to.be.true;
      });
    });
  });

  describe('When Function passed', function() {
    var target;
    beforeEach(function() {
      target = function() {
      };
    });

    describe('When passed with ResourcePool', function() {
      var pool, data;
      beforeEach(function() {
        pool = ResourcePool.create();
        data = getRAWResource(target, pool);
      });
      it('should result in proper RAW data', function() {
        expect(data[TARGET_DATA].id).to.be.a('string');
        expect(data[TARGET_DATA].type).to.be.a('string');
        expect(data[TARGET_DATA].poolId).to.be.a('string');
      });
      it('should register target in passed ResourcePool', function() {
        expect(pool.has(target)).to.be.true;
      });
      it('should not register target in default ResourcePool', function() {
        expect(ResourcePoolRegistry.defaultResourcePool.has(target)).to.be.false;
      });
    });

    describe('When passed without ResourcePool', function() {
      var data;
      beforeEach(function() {
        data = getRAWResource(target);
      });
      it('should result in proper RAW data', function() {
        expect(data[TARGET_DATA].id).to.be.a('string');
        expect(data[TARGET_DATA].type).to.be.a('string');
        expect(data[TARGET_DATA].poolId).to.be.a('string');
      });
      it('should register target in default ResourcePool', function() {
        expect(ResourcePoolRegistry.defaultResourcePool.has(target)).to.be.true;
      });
    });
  });
});

describe('getResourceData()', function() {
  it('should return raw data for RequestTarget', function(done) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTarget(promise);
    promise.then(function() {
      expect(getResourceData(resource)).to.be.eql(__createRequestTargetData()[TARGET_DATA]);
      done();
    });
  });
  it('should return raw data for RequestTarget wrapped with Proxy', function(data) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTargetProxy();
    promise.then(function() {
      expect(getResourceData(resource)).to.be.eql(__createRequestTargetData()[TARGET_DATA]);
      data();
    });
  });
  it('should return raw data for TargetResource', function() {
    var resource = __createTargetResource();
    data = {
      id: resource.id,
      type: resource.type,
      poolId: resource.poolId
    };
    expect(getResourceData(resource)).to.be.eql(data);
  });
  it('should return raw data for RAW resource', function() {
    var resource = __createRequestTargetData();
    expect(getResourceData(resource)).to.be.eql(resource[TARGET_DATA]);
  });
  it('should return null if data is not a resource', function(){
    expect(getResourceData({})).to.be.null;
  });
});

describe('getResourceId()', function() {
  it('should return ID for RequestTarget', function(done) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTarget(promise);
    promise.then(function() {
      expect(getResourceId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].id);
      done();
    });
  });
  it('should return ID for RequestTarget wrapped with Proxy', function(data) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTargetProxy();
    promise.then(function() {
      expect(getResourceId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].id);
      data();
    });
  });
  it('should return ID for TargetResource', function() {
    var resource = __createTargetResource();
    expect(getResourceId(resource)).to.be.equal(resource.id);
  });
  it('should return ID for RAW resource', function() {
    var resource = __createRequestTargetData();
    expect(getResourceId(resource)).to.be.equal(resource[TARGET_DATA].id);
  });
  it('should return null if data is not a resource', function(){
    expect(getResourceId({})).to.be.null;
  });
});

describe('getResourcePoolId()', function() {
  it('should return poolId for RequestTarget', function(done) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTarget(promise);
    promise.then(function() {
      expect(getResourcePoolId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].poolId);
      done();
    });
  });
  it('should return poolId for RequestTarget wrapped with Proxy', function(data) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTargetProxy();
    promise.then(function() {
      expect(getResourcePoolId(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].poolId);
      data();
    });
  });
  it('should return poolId for TargetResource', function() {
    var resource = __createTargetResource();
    expect(getResourcePoolId(resource)).to.be.equal(resource.poolId);
  });
  it('should return poolId for RAW resource', function() {
    var resource = __createRequestTargetData();
    expect(getResourcePoolId(resource)).to.be.equal(resource[TARGET_DATA].poolId);
  });
  it('should return null if data is not a resource', function(){
    expect(getResourcePoolId({})).to.be.null;
  });
});

describe('getResourceType()', function() {
  it('should return type for RequestTarget', function(done) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTarget(promise);
    promise.then(function() {
      expect(getResourceType(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].type);
      done();
    });
  });
  it('should return type for RequestTarget wrapped with Proxy', function(data) {
    var promise = __createDataResolvedPromise();
    var resource = __createRequestTargetProxy();
    promise.then(function() {
      expect(getResourceType(resource)).to.be.equal(__createRequestTargetData()[TARGET_DATA].type);
      data();
    });
  });
  it('should return type for TargetResource', function() {
    var resource = __createTargetResource();
    expect(getResourceType(resource)).to.be.equal(resource.type);
  });
  it('should return type for RAW resource', function() {
    var resource = __createRequestTargetData();
    expect(getResourceType(resource)).to.be.equal(resource[TARGET_DATA].type);
  });
  it('should return null if data is not a resource', function(){
    expect(getResourceType({})).to.be.null;
  });
});

describe('isResource()', function() {
  it('should return true for TargetResource', function() {
    expect(isResource(__createTargetResource())).to.be.true;
  });
  it('should return true for RequestTarget', function() {
    expect(isResource(__createRequestTarget())).to.be.true;
  });
  it('should return true for RequestTarget wrapped into Proxy', function() {
    expect(isResource(__createRequestTargetProxy(__createDataResolvedPromise()))).to.be.true;
  });
  it('should return true for RAW resource', function() {
    expect(isResource(__createRequestTargetData())).to.be.true;
  });
});

describe('isResourceConvertible()', function() {
  it('should return true for TargetResource', function() {
    expect(isResourceConvertible(__createTargetResource())).to.be.true;
  });
  it('should return true for RequestTarget', function() {
    expect(isResourceConvertible(__createRequestTarget())).to.be.true;
  });
  it('should return true for RequestTarget wrapped into Proxy', function() {
    expect(isResourceConvertible(__createRequestTargetProxy(__createDataResolvedPromise()))).to.be.true;
  });
  it('should return true for RAW resource', function() {
    expect(isResourceConvertible(__createRequestTargetData())).to.be.true;
  });
  it('should return true for IConvertible instance', function() {
    expect(isResourceConvertible(new IConvertible())).to.be.true;
  });
  it('should return true for function', function() {
    expect(isResourceConvertible(function() {
    })).to.be.true;
  });
});
