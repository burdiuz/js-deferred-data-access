import PoolRegistry from './PoolRegistry';
import ResourcePool, { getDefaultValidTargets, setValidTargets } from './ResourcePool';
import Resource from './Resource';
import createResource from './createResource';
import createResourcePool from './createResourcePool';
import createPoolRegistry from './createPoolRegistry';
import defaultResourcePool from './defaultResourcePool';

setValidTargets(getDefaultValidTargets());

export {
  Resource,
  PoolRegistry,
  ResourcePool,
  createResource,
  createResourcePool,
  createPoolRegistry,
  getDefaultValidTargets,
  setValidTargets,
  defaultResourcePool,
};
