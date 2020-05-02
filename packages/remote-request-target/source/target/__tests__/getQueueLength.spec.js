/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import getQueueLength from './getQueueLength';

describe('getQueueLength()', () => {
  let target;
  let result;

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: {
        queue: [{}, {}, {}, {}],
      },
    };
    result = getQueueLength(target);
  });

  it('should result with queue length', () => {
    expect(result).to.be.equal(4);
  });

  it('should result with undefined for not a Request target', () => {
    expect(getQueueLength({})).to.be.undefined;
  });
});
