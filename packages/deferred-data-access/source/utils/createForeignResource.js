import TARGET_DATA from './TARGET_DATA';
import getId from './getId';

export default (type = '', resource = {}) => {
  resource[TARGET_DATA] = {
    $id: `foreign-id-${getId()}`,
    $type: type || typeof resource,
    $poolId: `foreign-poolId-${getId()}`,
  };

  return resource;
};
