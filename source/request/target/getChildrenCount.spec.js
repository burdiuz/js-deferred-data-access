/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import SubTargets from './SubTargets';
import getChildrenCount from './getChildrenCount';

describe('getChildrenCount()', () => {
  let target;
  let result;

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: new SubTargets({}, [{}, {}, {}]),
    };
    result = getChildrenCount(target);
  });

  it('should result with children count', () => {
    expect(result).to.be.equal(3);
  });

  it('should be 0 for non-Resource target', () => {
    expect(getChildrenCount({})).to.be.equal(0);
  });
});
