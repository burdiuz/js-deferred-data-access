/**
 * Created by Oleg Galaburda on 03.03.16.
 */
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
  beforeEach(function() {

  });

  describe('When TargetResource passed', function() {
    beforeEach(function() {

    });
  });

  describe('When RequestTarget passed', function() {
    beforeEach(function() {

    });
  });

  describe('When IConvertible passed', function() {
    beforeEach(function() {

    });

    describe('When passed with ResourcePool', function() {
      beforeEach(function() {

      });
    });

    describe('When passed without ResourcePool', function() {
      beforeEach(function() {

      });
    });
  });

  describe('When Function passed', function() {
    beforeEach(function() {

    });
  });

  describe('When raw resource data passed', function() {
    beforeEach(function() {

    });
  });
});

describe('getResourceData()', function() {
  beforeEach(function() {

  });
});

describe('getResourceId()', function() {
  beforeEach(function() {

  });
});

describe('getResourcePoolId()', function() {
  beforeEach(function() {

  });
});

describe('getResourceType()', function() {
  beforeEach(function() {

  });
});

describe('isResource()', function() {
  beforeEach(function() {

  });
});

describe('isResourceConvertible()', function() {
  beforeEach(function() {

  });
});
