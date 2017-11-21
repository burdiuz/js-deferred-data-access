/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import SubTargets from './SubTargets';
import getChildren from './getChildren';

describe('getChildren()', () => {
  let target;
  let result;

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: new SubTargets({}, [{}, {}, {}]),
    };
    result = getChildren(target);
  });

  it('should result with list of children requests', () => {
    expect(result).to.have.length(3);
  });

  it('should be empty list for non-Resource target', () => {
    expect(getChildren({})).to.be.empty;
  });
});
