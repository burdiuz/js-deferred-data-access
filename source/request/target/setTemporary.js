/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';

export default (target, value) => {
  if (target && target[TARGET_INTERNALS]) {
    target[TARGET_INTERNALS].temporary = Boolean(value);
  }
};
