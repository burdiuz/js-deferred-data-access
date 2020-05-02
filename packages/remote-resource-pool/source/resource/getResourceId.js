import RESOURCE_INTERNALS_KEY from '../utils/RESOURCE_INTERNALS_KEY';
import RAW_RESOURCE_DATA_KEY from '../utils/RAW_RESOURCE_DATA_KEY';

export default (object) => {
  // if (object instanceof Resource || object instanceof Target) {
  if (typeof object[RESOURCE_INTERNALS_KEY] === 'object') {
    return object[RESOURCE_INTERNALS_KEY].id;
  }

  if (typeof object[RAW_RESOURCE_DATA_KEY] === 'object') {
    return object[RAW_RESOURCE_DATA_KEY].$id;
  }

  return null;
};
