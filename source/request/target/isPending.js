/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import getStatus from './getStatus';
import TargetStatus from '../../utils/TargetStatus';

export default (value) => (
  getStatus(value) === TargetStatus.PENDING
);
