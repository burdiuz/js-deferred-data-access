/**
 * Created by Oleg Galaburda on 25.11.17.
 */

import { createDeferred } from '../../../../shared-utils/Deferred';
import Children from './Children';
import { __createRequest } from '../../../tests/stubs';

describe('Children', () => {
  let sandbox;
  let instance;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('When created empty', () => {
    beforeEach(() => {
      instance = new Children();
    });

    it('should have zero length', () => {
      expect(instance).to.have.length(0);
    });

    it('should not have last item', () => {
      expect(instance.lastItem).to.be.null;
    });

    describe('When item registered', () => {
      let deferred;
      let child;
      let promise;

      beforeEach(() => {
        deferred = createDeferred();
        child = __createRequest(deferred.promise);
        promise = instance.register(child);
      });

      it('should have proper length', () => {
        expect(instance).to.have.length(1);
      });

      it('should have last item', () => {
        expect(instance.lastItem).to.be.equal(child);
      });

      it('should contain child item', () => {
        expect(instance.contains(child)).to.be.true;
        expect(instance.contains(__createRequest(Promise.resolve()))).to.be.false;
      });

      it('should return list with one child', () => {
        expect(instance.getList()).to.have.length(1);
        expect(instance.getList()[0]).to.be.equal(child);
      });

      describe('When child resolved', () => {
        beforeEach(() => {
          deferred.resolve();
          return promise;
        });

        it('should change length to zero', () => {
          expect(instance).to.have.length(0);
        });

        it('should not have last item', () => {
          expect(instance.lastItem).to.be.null;
        });
      });

      describe('When child resolved with empty list', () => {
        beforeEach(() => {
          instance.list = [];
          deferred.resolve();
        });

        it('should silently skip unregistered child', () => promise);
      });

      describe('When child rejected', () => {
        beforeEach(() => {
          deferred.reject();
          return promise;
        });

        it('should change length to zero', () => {
          expect(instance).to.have.length(0);
        });
      });
    });
  });

  describe('When created with child list', () => {
    let child1;
    let child2;
    let list;

    beforeEach(() => {
      child1 = __createRequest(Promise.resolve());
      child2 = __createRequest(Promise.reject());
      list = [
        child1,
        child2,
      ];

      instance = new Children(list);
    });

    it('should change proper length', () => {
      expect(instance).to.have.length(2);
      expect(instance.getList()).to.have.length(2);
    });

    it('should contain registered children', () => {
      expect(instance.contains(child1)).to.be.true;
      expect(instance.contains(child2)).to.be.true;
    });
  });
});
