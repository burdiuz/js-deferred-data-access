import TARGET_INTERNALS from './TARGET_INTERNALS';
import TARGET_DATA from './TARGET_DATA';
/* in case of circular dependency make empty base classes
   for both Target and Resource and check for them:

   Target will have:
s    class Target extends TargetBase {

   this function will have:
    object instanceof TargetBase
 */
import Target from '../request/Target';
import Resource from '../resource/Resource';

export default (object) => {
  if (!object) return false;

  if (
    object instanceof Resource
    // this case for RAW resources passed via JSON conversion,
    // look like {'resource::data': {$id: '1111', $poolId: '22222'}}
    || object[TARGET_DATA] // (object[TARGET_DATA] && typeof object[TARGET_DATA] === 'object')
  ) {
    return true;
  } else if (
    object instanceof Target
    || object[TARGET_INTERNALS] // (object[TARGET_INTERNALS] && typeof object[TARGET_INTERNALS] === 'object')
  ) {
    // now all targets have internals in them, so we have to check if id and poolId are valid
    // to treat target as resource. In case of Proxy enabled instanceof will be Function,
    // so we have to check for internals.
    return object[TARGET_INTERNALS].isResource();
  }

  return false;
};
