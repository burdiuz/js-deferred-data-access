/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import { getChildRequests } from '../Target';

export default (target) => {
  const children = getChildRequests(target);
  return children ? children.length : 0;
};
