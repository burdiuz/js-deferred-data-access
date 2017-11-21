/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import hadChildPromises from './hadChildPromises';

describe('hadChildPromises()', () => {
  let target;
  let result;

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: {
        hadChildPromises: false,
      },
    };
    result = hadChildPromises(target);
  });

  it('should result with internal hadChildPromises value', () => {
    expect(result).to.be.false;
  });

  it('should be undefined for non-Resource target', () => {
    expect(hadChildPromises({})).to.be.false;
  });
});
