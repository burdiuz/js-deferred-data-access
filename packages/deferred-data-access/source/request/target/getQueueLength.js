/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import getInternals from './getInternals';

export default (target) => {
  const internals = getInternals(target);
  if (internals) {
    const { queue } = internals;
    return queue ? queue.length : 0;
  }

  return undefined;
};
