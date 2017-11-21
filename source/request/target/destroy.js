/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import TARGET_INTERNALS from '../../utils/TARGET_INTERNALS';

export default (target) => (
  target &&
  target[TARGET_INTERNALS] ? target[TARGET_INTERNALS].destroy() : null
);

