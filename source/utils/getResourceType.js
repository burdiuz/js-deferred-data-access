import TARGET_INTERNALS from './TARGET_INTERNALS';
import TARGET_DATA from './TARGET_DATA';
import isResource from './isResource';

const getResourceType = (object) => {
  if (typeof object[TARGET_INTERNALS] === 'object') {
    return object[TARGET_INTERNALS].type;
  } else if (isResource(object)) {
    return object[TARGET_DATA].type;
  }

  return null;
};

export default getResourceType;
