/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import setTemporary from './setTemporary';

describe('setTemporary()', () => {
  let target;

  beforeEach(() => {
    target = {
      [TARGET_INTERNALS]: {
        temporary: false,
      },
    };
    setTemporary(target, true);
  });

  it('should update "temporary" value', () => {
    expect(target[TARGET_INTERNALS].temporary).to.be.true;
  });

  it('should throw an error for not a Request target', () => {
    expect(() => {
      setTemporary({}, true);
    }).to.throw();
  });
});
