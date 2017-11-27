/**
 * Created by Oleg Galaburda on 16.11.17.
 */

import getInternals from './getInternals';

export default (target, value) => getInternals(target).temporary = Boolean(value);
