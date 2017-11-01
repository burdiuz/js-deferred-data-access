import TARGET_INTERNALS from './TARGET_INTERNALS';
import TARGET_DATA from './TARGET_DATA';
import isResource from './isResource';

export default (object) => {
  // if (object instanceof TargetResource || object instanceof RequestTarget) {
  if (typeof object[TARGET_INTERNALS] === 'object') {
    return object[TARGET_INTERNALS].id;
  } else if (isResource(object)) {
    return object[TARGET_DATA].id;
  }

  return null;
};
