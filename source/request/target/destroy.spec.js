/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import destroy from './destroy';

describe('destroy()', () => {
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
        destroy: sandbox.stub().returns({}),
      },
    };
    result = destroy(target);
  });

  it('should call internal function', () => {
    expect(target[TARGET_INTERNALS].destroy).to.be.calledOnce;
  });

  it('should return call result', () => {
    expect(result).to.be.an('object');
  });

  it('should return null for non-Resource target', () => {
    expect(destroy({})).to.be.null;
  });
});
