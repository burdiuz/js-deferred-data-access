/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TargetStatus from '../../utils/TargetStatus';
import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import isPending from './isPending';

describe('isPending()', () => {
  let target;
  let result;

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: {
        status: TargetStatus.PENDING,
      },
    };
    result = isPending(target);
  });

  it('should result with TRUE if status is "pending"', () => {
    expect(result).to.be.true;
  });

  it('should result with undefined for not a Request target', () => {
    expect(isPending({})).to.be.undefined;
  });
});
