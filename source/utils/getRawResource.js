import TARGET_INTERNALS from './TARGET_INTERNALS';
import IConvertible from './IConvertible';
import isResource from './isResource';
import { toJSON } from '../request/Target';
import { defaultResourcePool } from '../resource/ResourcePool';
import Resource from '../resource/Resource';

export default (object, pool) => {
  pool = pool || defaultResourcePool;

  if (object instanceof Resource) {
    return object.toJSON();
  } else if (typeof object[TARGET_INTERNALS] === 'object') {
    return toJSON(object);
  } else if (object instanceof IConvertible || typeof object === 'function') {
    return pool.set(object).toJSON();
  } else if (isResource(object)) {
    return object;
  }

  return null;
};
