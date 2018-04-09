import RAW_RESOURCE_DATA_KEY from '../utils/RAW_RESOURCE_DATA_KEY';
import generateId from '../utils/generateId';

export default (type = '', resource = {}) => {
  resource[RAW_RESOURCE_DATA_KEY] = {
    $id: `foreign-id-${generateId()}`,
    $type: type || typeof resource,
    $poolId: `foreign-poolId-${generateId()}`,
  };

  return resource;
};
