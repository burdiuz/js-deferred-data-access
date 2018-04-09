/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import getInternals from './getInternals';

export default (target) => {
  const internals = getInternals(target);
  return internals ? internals.toJSON() : undefined;
};

