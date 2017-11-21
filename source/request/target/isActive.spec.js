/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import isActive from './isActive';

describe('isActive()', () => {
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
        isActive: sandbox.stub().returns(false),
      },
    };
    result = isActive(target);
  });

  it('should call internal function', () => {
    expect(target[TARGET_INTERNALS].isActive).to.be.calledOnce;
  });

  it('should return call result', () => {
    expect(result).to.be.false;
  });

  it('should be false for non-Resource target', () => {
    expect(isActive({})).to.be.false;
  });
});
