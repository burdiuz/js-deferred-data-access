import RAW_RESOURCE_DATA_KEY from './utils/RAW_RESOURCE_DATA_KEY';
import RESOURCE_INTERNALS_KEY from './utils/RESOURCE_INTERNALS_KEY';
import getInternals from './utils/getInternals';
import generateId from 'shared-utils/generateId';

const getPoolId = (pool) => (pool ? pool.id : null);

/**
 * @exports Resource
 */
class Resource {
  constructor(pool, value, type, id) {
    Object.defineProperties(this, {
      [RESOURCE_INTERNALS_KEY]: {
        value: {
          pool,
          value,
          type,
          id,
          active: true,
          poolId: getPoolId(pool),
        },
      },
      [RAW_RESOURCE_DATA_KEY]: {
        get: this.toJSON,
      },
    });
  }


  get active() {
    return Boolean(getInternals(this).active);
  }

  get value() {
    return getInternals(this).value;
  }

  get type() {
    return getInternals(this).type || typeof getInternals(this).value;
  }

  get id() {
    return getInternals(this).id;
  }

  get poolId() {
    return getInternals(this).poolId;
  }

  toJSON = () => ({
    [RAW_RESOURCE_DATA_KEY]: {
      $id: this.id,
      $type: this.type,
      $poolId: this.poolId,
    },
  });

  destroy() {
    const internals = getInternals(this);
    const { id, pool } = internals;

    if (!internals.active) {
      return;
    }

    internals.active = false;
    pool.remove(id);

    Object.keys(internals).map((name) => delete internals[name]);
  }
}

export default Resource;
