/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';

export default (target) => {
  const internals = target[TARGET_INTERNALS];
  if (internals && internals.queue) {
    return internals.queue.length;
  }

  return 0;
};
