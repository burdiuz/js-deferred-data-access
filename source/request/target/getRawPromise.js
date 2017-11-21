/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';
import PROMISE_FIELD from './PROMISE_FIELD';

export default (target) => {
  const internals = target[TARGET_INTERNALS];
  if (internals && internals.promise) {
    return internals.promise;
  }
  return target[PROMISE_FIELD] || null;
};

