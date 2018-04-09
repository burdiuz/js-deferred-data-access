/**
 * Created by Oleg Galaburda on 25.11.17.
 */
import Deferred, { createDeferred } from '../../utils/Deferred';
import Queue from './Queue';

describe('Queue', () => {
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
      instance = new Queue();
    });

    it('should have length 0', () => {
      expect(instance.length).to.be.equal(0);
    });

    it('should result in empty list', () => {
      expect(instance.getList()).to.be.empty;
    });

    it('should not have commands', () => {
      expect(instance.getCommands()).to.be.empty;
    });

    describe('When item added', () => {
      let item;

      beforeEach(() => {
        item = {
          pack: {
            propertyName: 'item-name',
            command: 'item-pack',
          },
          child: { type: 'item-child' },
        };

        instance.add(item.pack, item.child);
      });

      it('should store item to the list', () => {
        expect(instance.length).to.be.equal(1);
        expect(instance.getList()).to.be.eql([
          item,
        ]);
      });

      it('should return list with command', () => {
        expect(instance.getCommands()).to.be.eql([item.name]);
      });

      describe('When sent', () => {
        let id;
        let callback;

        beforeEach(() => {
          id = '123/456-7890';
          callback = sandbox.spy();
          instance.send(id, callback);
        });

        it('should call callback function', () => {
          expect(callback).to.be.calledOnce;
          expect(callback).to.be.calledWith(
            { ...item.pack, target: id },
            sinon.match.instanceOf(Deferred),
            item.child,
          );
        });

        it('should clear the list', () => {
          expect(instance.length).to.be.equal(0);
          expect(instance.getList()).to.be.empty;
        });
      });

      describe('When rejected', () => {
        describe('When custom message passed', () => {
          let message;

          beforeEach(() => {
            message = 'This is the custom message';
            instance.reject(message);
          });

          it('should reject item promise', () => {
            return item.deferred.promise
              .then(() => assert(false, 'Promise must be rejected'))
              .catch((error) => {
                expect(error.message).to.be.equal(message);
              });
          });

          it('should clear the list', () => {
            expect(instance.length).to.be.equal(0);
            expect(instance.getList()).to.be.empty;
          });
        });

        describe('When rejected without message', () => {
          beforeEach(() => {
            instance.reject();
          });

          it('should reject item promise', () => {
            return item.deferred.promise
              .then(() => assert(false, 'Promise must be rejected'))
              .catch((error) => {
                expect(error.message).to.not.be.empty;
                expect(error.message).to.be.a('string');
              });
          });

          it('should clear the list', () => {
            expect(instance.length).to.be.equal(0);
            expect(instance.getList()).to.be.empty;
          });
        });
      });
    });
  });

  describe('When created with item list', () => {
    let list;

    beforeEach(() => {
      list = [];
      instance = new Queue(list);
    });

  });
})
;
