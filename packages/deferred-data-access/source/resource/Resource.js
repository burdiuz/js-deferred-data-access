import TARGET_DATA from '../utils/TARGET_DATA';
import TARGET_INTERNALS from '../utils/TARGET_INTERNALS';
import getInternals from '../request/target/getInternals';
import getId from '../../../shared-utils/getId';

const getPoolId = (pool) => (pool ? pool.id : null);

/**
 * @exports Resource
 */
class Resource {
  constructor(pool, value, type, id) {
    Object.defineProperties(this, {
      [TARGET_INTERNALS]: {
        value: {
          pool,
          value,
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
    [TARGET_DATA]: {
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

export const createResource = (pool, value, resourceType, id = null) => (
  new Resource(pool, value, resourceType, id || getId())
);

export default Resource;
