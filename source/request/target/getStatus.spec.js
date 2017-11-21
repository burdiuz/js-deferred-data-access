/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TargetStatus from '../../utils/TargetStatus';
import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import getStatus from './getStatus';

describe('getStatus()', () => {
  let target;
  let result;

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: {
        status: TargetStatus.DESTROYED,
      },
    };
    result = getStatus(target);
  });

  it('should result with target status', () => {
    expect(result).to.be.equal(TargetStatus.DESTROYED);
  });

  it('should return null for non-Resource target', () => {
    expect(getStatus({})).to.be.null;
  });
});
