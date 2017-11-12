import TARGET_DATA from '../utils/TARGET_DATA';
import TARGET_INTERNALS from '../utils/TARGET_INTERNALS';
import getId from '../utils/getId';

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
    return Boolean(this[TARGET_INTERNALS].active);
  }

  get value() {
    return this[TARGET_INTERNALS].value;
  }

  get type() {
    return this[TARGET_INTERNALS].type || typeof this[TARGET_INTERNALS].value;
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
      poolId: this.poolId,
    },
  });

  destroy() {
    const internals = this[TARGET_INTERNALS];
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
