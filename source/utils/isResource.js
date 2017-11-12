import TARGET_INTERNALS from './TARGET_INTERNALS';
import TARGET_DATA from './TARGET_DATA';
import Target from '../request/Target';
import Resource from '../resource/Resource';

export default (object) => object instanceof Resource ||
  object instanceof Target ||
  (object && (
    // this case for Targets and Resources which contain
    // data in TARGET_INTERNALS Symbol
    // We check for their types above but in cases when Proxies are enabled
    // their type will be Function and verification will come to this case
    typeof object[TARGET_INTERNALS] === 'object' ||
    // this case for RAW resources passed via JSON conversion,
    // look like {'resource::data': {id: '1111', poolId: '22222'}}
    typeof object[TARGET_DATA] === 'object'
  ));
