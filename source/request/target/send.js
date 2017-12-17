/**
 * Created by Oleg Galaburda on 2.12.17.
 */

import getInternals from './getInternals';

export default (
  target,
  command,
  args = [],
  propertyName = null,
) => getInternals(target)
  .send({
    propertyName,
    command,
    args
  });
