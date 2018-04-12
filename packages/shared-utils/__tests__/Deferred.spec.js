import { createDeferred } from '../Deferred';

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
      beforeEach(() =>
        /**
         * 1. if promise never resolved this wil cause test fail because `done()`
         * callback never called
         * 2. if promise resolved with RESOLVED, then we call `done()` without error
         * 3. if promise resolved with REJECTion, then we call `done()` with error text
         * stubs not needed
         */
        deferred.promise);
    });

    describe('When deferred failed', () => {
      beforeEach(() =>
        // promises resolved asynchronously
        deferred.promise
          .then(() => assert(false, 'should be rejected')));
    });

  });
});
