/**
 * Created by Oleg Galaburda on 25.11.17.
 */

import Deferred from '../../utils/Deferred';
import TargetStatus from '../../utils/TargetStatus';
import SubTargets from './SubTargets';
import {
  __createRequestData,
  __createRequest,
  __createDataResolvedPromise,
} from '../../../tests/stubs';

describe('SubTargets', () => {
  let sandbox;
  let parent;
  let handlers;
  let hasHandler;
  let handleResult;
  let requestTarget;
  let isTemporaryResult;
  let instance;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    requestTarget = {};
    hasHandler = true;
    handlers = {
      handle: sandbox.spy((a, b, c, deferred) => deferred.resolve(handleResult)),
      hasCommand: sandbox.spy(() => hasHandler),
      isTemporary: sandbox.spy(() => isTemporaryResult),
    };
    parent = {
      id: 'my-parent-id-123',
      status: TargetStatus.PENDING,
      target: requestTarget,
      handlers: handlers,
      toJSON: __createRequestData,
    }
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('When created empty', () => {
    beforeEach(() => {
      instance = new SubTargets();
    });
    describe('When item added', () => {
      beforeEach(() => null);
    });

    describe('When item removed', () => {
      beforeEach(() => null);
    });
  });

  describe('When created with item list', () => {
    let children;

    beforeEach(() => {
      children = [];
      instance = new SubTargets(parent, children);
    });

  });

  describe('When making child request', () => { // add to queue
    let result;

    beforeEach(() => {
      handleResult = 'hi :)';
      instance = new SubTargets(parent);
      result = instance.send('command', {
        type: 'do-something',
        cmd: 'with-this',
        value: 'thanks',
      });
    });

    it('should have recorded request in queue', () => {
      expect(instance.queue).to.have.length(1);
    });

    it('should not send request immediately', () => {
      expect(handlers.handle).to.not.be.called;
    });

    it('result of call should be a Promise', () => {
      expect(result).to.be.an.instanceof(Promise);
    });
  });

  describe('When parent resolved', () => {
    beforeEach(() => {
      instance = new SubTargets(parent);
      parent.status = TargetStatus.RESOLVED;
      instance.parentResolved();
    });

    describe('When making child request', () => { // handle immediately
      let result;
      beforeEach(() => {
        instance = new SubTargets(parent);
        handleResult = 'nope';
        result = instance.send('name', {
          command: 'type',
          args: ['command', 'way-lue'],
          target: __createRequestData(),
        });
      });

      it('should not use queue', () => {
        expect(instance.queue).to.be.null;
      });

      it('should handle request immediately', () => {
        expect(handlers.handle).to.be.calledOnce;
        const { args } = handlers.handle.getCall(0);
        expect(args[0]).to.be.equal(requestTarget);
        expect(args[1]).to.be.equal('name');
        expect(args[2]).to.be.eql({
          command: 'type',
          args: ['command', 'way-lue'],
          target: __createRequestData(),
        });
        expect(args[3]).to.be.an.instanceof(Deferred);
      });
    });
  });

  describe('When making child request to destroyed parent', () => {
    let result;

    beforeEach(() => {
      parent.status = TargetStatus.DESTROYED;
      instance = new SubTargets(parent);
      result = instance.send('name', {
        type: 'type',
        cmd: 'command',
        value: 'way-lue',
        target: parent.id,
      });
    });

    it('should result in rejected promise', () => result
      .then(() => assert(false, 'Promise should be rejected'))
      .catch((error) => {
        expect(error).to.be.instanceof(Error);
      }),
    );
  });

  describe('When making child request to parent with unknown status', () => {
    let result;

    beforeEach(() => {
      parent.status = 'I am not responsible parent';
      instance = new SubTargets(parent);
      result = instance.send('name', {
        type: 'type',
        cmd: 'command',
        value: 'way-lue',
        target: parent.id,
      });
    });

    it('should result in rejected promise', () => result
      .then(() => assert(false, 'Promise should be rejected'))
      .catch((error) => {
        expect(error).to.be.instanceof(Error);
      }),
    );
  });

  describe('When making child request to unknown command', () => {
    let result;

    beforeEach(() => {
      parent.status = TargetStatus.RESOLVED;
      instance = new SubTargets(parent);
      hasHandler = false;
      result = instance.send('what a shame', {
        type: 'type',
        cmd: 'command',
        value: 'way-lue',
        target: parent.id,
      });
    });

    it('should result in rejected promise', () => result
      .then(() => assert(false, 'Promise should be rejected'))
      .catch((error) => {
        expect(error).to.be.instanceof(Error);
      }),
    );
  });

  describe('When making child request with child request instance', () => {
    let child;

    beforeEach(() => {
      parent.status = TargetStatus.RESOLVED;
      instance = new SubTargets(parent);
      child = __createRequest();
      instance.send(
        'command',
        {
          type: 'type',
          cmd: 'command',
          value: 'whole world is gone crazy',
          target: parent.id,
        },
        null,
        child,
      );
    });

    it('should register child', () => {
      expect(instance.length).to.be.equal(1);
      expect(instance.getList()).to.contain(child);
    });
  });

  describe('When parent rejected', () => {
    let child;

    beforeEach(() => {
      instance = new SubTargets(parent);
      child = instance.send('1', 'one');
      parent.status = TargetStatus.REJECTED;
      instance.parentRejected();
    });

    it('should reject queue', () => child
      .then(() => assert(false, 'should be rejected'))
      .catch((data) => expect(data).to.be.an.instanceof(Error)));

    describe('When making child request', () => { // reject immediately
      let result;
      beforeEach(() => {
        result = instance.send('any-name', {
          type: 'any-type',
          cmd: 'any-command',
          value: 'any-way-lue',
        });
      });

      it('should handle request internally', () => {
        expect(handlers.handle).to.not.be.called;
      });
    });
  });

  describe('When parent resolved with pending queue', () => {
    beforeEach(() => {
      instance = new SubTargets(parent);
      instance.send('name', { type: 'type', cmd: 'command', value: 'way-lue' });
      instance.send('no-name', { type: 'no-type', cmd: 'no-command', value: 'no-way-lue' });
      parent.status = TargetStatus.RESOLVED;
      instance.parentResolved();
    });

    it('should send queued requests', () => {
      expect(handlers.handle).to.be.calledTwice;
      expect(handlers.handle).to.be.calledWith(requestTarget, 'name');
      expect(handlers.handle).to.be.calledWith(requestTarget, 'no-name');
    });

    it('should destroy queue list', () => {
      expect(instance.queue).to.be.null;
    });
  });

  describe('When registering children', () => {
    let child;
    let childPromise;

    beforeEach(() => {
      instance = new SubTargets(parent);
    });

    describe('When registered child is fulfilled', () => {
      beforeEach(() => {
        child = __createRequest();
        childPromise = instance.register(child);
      });

      it('should add pending child to the list', () => {
        expect(instance.length).to.be.equal(1);
        expect(instance.getList()).to.contain(child);
      });

      it('should remove child from the list when its resolved', () => {
        return childPromise.then(() => {
          expect(instance.getList()).to.not.contain(child);
        })
      });
    });

    describe('When registered child is rejected', () => {
      beforeEach(() => {
        child = __createRequest(Promise.reject(new Error('bad child')));
        childPromise = instance.register(child);
      });

      it('should add pending child to the list', () => {
        expect(instance).to.have.length(1);
        expect(instance.getList()).to.contain(child);
      });

      it('should remove child from the list when its rejected', () => {
        return childPromise
          .then(() => assert(false, 'should be rejected'))
          .catch(() => {
            expect(instance.getList()).to.not.contain(child);
          });
      });
    });
  });
});
/*
// when fulfilled


  describe('When destroyed', () => {
    beforeEach(() => {
      linkData = __createRequestData();
      deferred.resolve(linkData);
      return deferred.promise.then(() => instance.destroy());
    });

    it('should not be active', () => {
      expect(instance.isActive()).to.be.false;
    });

    describe('When making child request', () => { // reject immediately
      let result;
      beforeEach(() => {
        handlers.handle.reset();
        result = instance.send('any-name', {
          type: 'any-type',
          cmd: 'any-command',
          value: 'any-way-lue',
        });
      });

      it('promise should be rejected', () => result.catch((data) => {
        assert(data instanceof Error, 'promise result must be an error instance');
      }));

      it('should handle request internally', () => {
        expect(handlers.handle).to.not.be.called;
      });
    });
  });


  describe('When sending request', () => {
    describe('When target was fulfilled', () => {
      beforeEach(() => {
        linkData = __createRequestData();
        deferred.resolve(linkData);
        return deferred.promise.then(() => {
          hasHandler = false;
        });
      });

      it('should immediately throw error on not existent handler', () => {
        expect(() => {
          instance.send('any', { type: 'thing' });
        }).to.throw(Error);
      });

      describe('When passing child request', () => {
        let child;

        beforeEach(() => {
          child = __createRequest();
          hasHandler = true;
          instance.send('any', {}, null, child);
        });

        it('should register child', () => {
          expect(instance.register).to.be.calledOnce;
          expect(instance.register).to.be.calledWith(child);
        });
      });

    });
  });
*/
