/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import getRawPromise from './getRawPromise';

describe('getRawPromise()', () => {
  let target;
  let result;

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: {
        promise: Promise.resolve(),
      },
    };
    result = getRawPromise(target);
  });

  it('should result with targets promise', () => {
    expect(result).to.be.equal(target[TARGET_INTERNALS].promise);
  });

  it('should result with undefined for not a Request target', () => {
    expect(getRawPromise({})).to.be.undefined;
  });
});
