/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import isTemporary from './isTemporary';

describe('isTemporary()', () => {
  let target;
  let result;

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: {
        temporary: true,
      },
    };
    result = isTemporary(target);
  });

  it('should result with TRUE if target is temporary', () => {
    expect(result).to.be.true;
  });

  it('should result with undefined for not a Request target', () => {
    expect(isTemporary({})).to.be.undefined;
  });
});
