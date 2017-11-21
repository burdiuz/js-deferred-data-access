/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';

export default (target) => {
  const queue = target && target[TARGET_INTERNALS] && target[TARGET_INTERNALS].queue;
  return queue ? queue.getCommands() : [];
};
