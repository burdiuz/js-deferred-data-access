'use strict';

import { TARGET_DATA, TARGET_INTERNALS, getId } from '../core';

const getPoolId = (pool) => pool ? pool.id : null;

/**
 * @exports TargetResource
 */
class TargetResource {
  constructor(pool, resource, type, id) {
    Object.defineProperties(this, {
      [TARGET_INTERNALS]: {
        value: {
          pool,
          resource,
          type,
          id,
          active: true,
          poolId: getPoolId(pool),
        },
      },
      [TARGET_DATA]: {
        get: this.toJSON,
      },
    });
  }


  get active() {
    return Boolean(this[TARGET_INTERNALS].active);
  }

  get resource() {
    return this[TARGET_INTERNALS].resource;
  }

  get type() {
    return this[TARGET_INTERNALS].type || typeof(this[TARGET_INTERNALS].resource);
  }

  get id() {
    return this[TARGET_INTERNALS].id;
  }

  get poolId() {
    return this[TARGET_INTERNALS].poolId;
  }

  toJSON = () => ({
    [TARGET_DATA]: {
      id: this.id,
      type: this.type,
      poolId: this.poolId
    },
  });

  destroy() {
    const { id, pool } = this;
    const internals = this[TARGET_INTERNALS];

    if (!internals.active) {
      return;
    }

    internals.active = false;
    pool.remove(id);

    for (let name in internals) {
      delete internals[name];
    }
  }
}

export const createTargetResource = (pool, resource, resourceType, id) => {
  return new TargetResource(pool, resource, resourceType, id || getId());
};

export default TargetResource;
