import { TARGET_INTERNALS, TARGET_DATA } from '../core';
import RequestTarget from '../request/RequestTarget';
import ResourcePoolRegistry from './ResourcePoolRegistry';
import TargetResource from './TargetResource';

/**
 * Interface for all resource types, these will be treated as resources automatically
 * @interface
 * @alias DataAccessInterface.IConvertible
 */
export class IConvertible {

}

export const isResource = (object) => {
  return object instanceof TargetResource ||
    object instanceof RequestTarget ||
    (object && (
      // this case for RequestTargets and TargetResources which contain data in TARGET_INTERNALS Symbol
      // We check for their types above but in cases when Proxies are enabled their type will be Function
      // and verification will come to this case
      typeof(object[TARGET_INTERNALS]) === 'object' ||
      // this case for RAW resources passed via JSON conversion, look like {'resource::data': {id: '1111', poolId: '22222'}}
      typeof(object[TARGET_DATA]) === 'object'
    ));
};

export const isResourceConvertible = (data) => {
  return isResource(data) || typeof(data) === 'function' || data instanceof IConvertible;
};

export const getResourceId = (object) => {
  let id = null;
  //if (object instanceof TargetResource || object instanceof RequestTarget) {
  if (typeof(object[TARGET_INTERNALS]) === 'object') {
    id = object[TARGET_INTERNALS].id;
  } else if (isResource(object)) {
    id = object[TARGET_DATA].id;
  }
  return id;
};

export const getResourcePoolId = (object) => {
  let poolId = null;
  if (typeof(object[TARGET_INTERNALS]) === 'object') {
    poolId = object[TARGET_INTERNALS].poolId;
  } else if (isResource(object)) {
    poolId = object[TARGET_DATA].poolId;
  }
  return poolId;
};

export const getResourceType = (object) => {
  let type = null;
  if (typeof(object[TARGET_INTERNALS]) === 'object') {
    type = object[TARGET_INTERNALS].type;
  } else if (isResource(object)) {
    type = object[TARGET_DATA].type;
  }
  return type;
};

export const getRAWResource = (object, pool) => {
  pool = pool || ResourcePoolRegistry.defaultResourcePool;
  let data = null;
  if (object instanceof TargetResource) {
    data = object.toJSON();
  } else if (typeof(object[TARGET_INTERNALS]) === 'object') {
    data = RequestTarget.toJSON(object);
  } else if (object instanceof IConvertible || typeof(object) === 'function') {
    data = pool.set(object).toJSON();
  } else if (isResource(object)) {
    data = object;
  }
  return data;
};

export const getResourceData = (object) => {
  const data = getRAWResource(object);
  return data ? data[TARGET_DATA] : null;
};

export const createForeignResource = (type) => {
  const resource = {};
  resource[TARGET_DATA] = {
    id: 'foreign-id-' + getId(),
    type: type || typeof(resource),
    poolId: 'foreign-poolId-' + getId()
  };
  return resource;
};

export const areSameResource = (resource1, resource2) => {
  return isResource(resource1) && isResource(resource2) &&
    getResourceId(resource1) === getResourceId(resource2) &&
    getResourcePoolId(resource1) === getResourcePoolId(resource2);
};
