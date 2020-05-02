/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import canBeDestroyed from './canBeDestroyed';

describe('canBeDestroyed()', () => {
  let target;
  let result;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: {
        canBeDestroyed: sandbox.stub().returns(true),
      },
    };
    result = canBeDestroyed(target);
  });

  it('should call internal function', () => {
    expect(target[TARGET_INTERNALS].canBeDestroyed).to.be.calledOnce;
  });

  it('should return call result', () => {
    expect(result).to.be.true;
  });

  it('should result with undefined for not a Request target', () => {
    expect(canBeDestroyed({})).to.be.undefined;
  });
});
