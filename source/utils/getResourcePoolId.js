import TARGET_INTERNALS from './TARGET_INTERNALS';
import TARGET_DATA from './TARGET_DATA';
import isResource from './isResource';

export default (object) => {
  if (typeof object[TARGET_INTERNALS] === 'object') {
    return object[TARGET_INTERNALS].poolId;
  } else if (isResource(object)) {
    return object[TARGET_DATA].poolId;
  }
  return null;
};
