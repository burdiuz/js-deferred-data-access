import { ResourcePool } from "./resource-pool";

const generateGetDefaultResourcePool =
  (pool?: ResourcePool) => (): ResourcePool => {
    if (!pool) {
      pool = new ResourcePool();
    }

    return pool;
  };

  export const getDefaultResourcePool = generateGetDefaultResourcePool();