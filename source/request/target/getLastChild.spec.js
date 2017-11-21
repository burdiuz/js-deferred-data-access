/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import SubTargets from './SubTargets';
import getLastChild from './getLastChild';

describe('getLastChild()', () => {
  let target;
  let result;
  let lastItem;

  beforeEach(() => {
    lastItem = {};
    target = {
      [TARGET_INTERNALS]: new SubTargets({}, [{}, {}, lastItem]),
    };
    result = getLastChild(target);
  });

  it('should result with last item from children', () => {
    expect(result).to.be.equal(lastItem);
  });
});
