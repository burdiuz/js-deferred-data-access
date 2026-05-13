import { ResourcePool } from "./resource-pool";

let defaultResourcePool: ResourcePool | undefined;

export const getDefaultResourcePool = (): ResourcePool => {
  if (!defaultResourcePool) {
    defaultResourcePool = new ResourcePool();
  }
  return defaultResourcePool;
};

export const setDefaultResourcePool = (pool: ResourcePool): void => {
  defaultResourcePool = pool;
};