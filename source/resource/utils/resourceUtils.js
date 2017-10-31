import { TARGET_INTERNALS, TARGET_DATA, getId } from '../utils';
import { RequestTarget } from '../../request';
import defaultResourcePool from './defaultResourcePool';
import IConvertible from './IConvertible';
import TargetResource from '../TargetResource';

export const isResource = (object) => object instanceof TargetResource ||
  object instanceof RequestTarget ||
  (object && (
    // this case for RequestTargets and TargetResources which contain
    // data in TARGET_INTERNALS Symbol
    // We check for their types above but in cases when Proxies are enabled
    // their type will be Function and verification will come to this case
    typeof object[TARGET_INTERNALS] === 'object' ||
    // this case for RAW resources passed via JSON conversion,
    // look like {'resource::data': {id: '1111', poolId: '22222'}}
    typeof object[TARGET_DATA] === 'object'
  ));

export const getResourceId = (object) => {
  // if (object instanceof TargetResource || object instanceof RequestTarget) {
  if (typeof object[TARGET_INTERNALS] === 'object') {
    return object[TARGET_INTERNALS];
  } else if (isResource(object)) {
    return object[TARGET_DATA].id;
  }

  return null;
};

export const getResourcePoolId = (object) => {
  if (typeof object[TARGET_INTERNALS] === 'object') {
    return object[TARGET_INTERNALS].poolId;
  } else if (isResource(object)) {
    return object[TARGET_DATA].poolId;
  }

  return null;
};

export const getResourceType = (object) => {
  if (typeof object[TARGET_INTERNALS] === 'object') {
    return object[TARGET_INTERNALS].type;
  } else if (isResource(object)) {
    return object[TARGET_DATA].type;
  }

  return null;
};

export const getRawResource = (object, pool) => {
  pool = pool || defaultResourcePool;

  if (object instanceof TargetResource) {
    return object.toJSON();
  } else if (typeof object[TARGET_INTERNALS] === 'object') {
    return RequestTarget.toJSON(object);
  } else if (object instanceof IConvertible || typeof object === 'function') {
    return pool.set(object).toJSON();
  } else if (isResource(object)) {
    return object;
  }

  return null;
};

export const getResourceData = (object) => {
  const data = getRawResource(object);
  return data ? data[TARGET_DATA] : null;
};

export const createForeignResource = (type, resource = {}) => {
  resource[TARGET_DATA] = {
    id: `foreign-id-${getId()}`,
    type: type || typeof resource,
    poolId: `foreign-poolId-${getId()}`,
  };

  return resource;
};

export const areSameResource = (resource1, resource2) => (
  isResource(resource1)
  && isResource(resource2)
  && getResourceId(resource1) === getResourceId(resource2)
  && getResourcePoolId(resource1) === getResourcePoolId(resource2)
);
