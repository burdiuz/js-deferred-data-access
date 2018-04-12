import getId from 'shared-utils/getId';

import TARGET_DATA from './TARGET_DATA';

export default (type = '', resource = {}) => {
  resource[TARGET_DATA] = {
    $id: `foreign-id-${getId()}`,
    $type: type || typeof resource,
    $poolId: `foreign-poolId-${getId()}`,
  };

  return resource;
};
