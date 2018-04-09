import RAW_RESOURCE_DATA_KEY from '../utils/RAW_RESOURCE_DATA_KEY';
import Resource from '../Resource';

export default (object) => {
  if (!object) return false;

  if (
    object instanceof Resource
    // this case for RAW resources passed via JSON conversion,
    // look like {'resource::data': {$id: '1111', $poolId: '22222'}}
    // (object[RAW_RESOURCE_DATA_KEY] && typeof object[RAW_RESOURCE_DATA_KEY] === 'object')
    || object[RAW_RESOURCE_DATA_KEY]
  ) {
    return true;
  }

  return false;
};
