'use strict';
var TargetResource = (function() {
  /**
   * The object that can be used to send Target to other side
   * @constructor
   */
  function TargetResource(_pool, _resource, resourceType, _id) {
    Object.defineProperty(this, TARGET_INTERNALS, { // private read-only property
      value: {
        active: true,
        pool: _pool,
        poolId: _pool ? _pool.id : null,
        resource: _resource,
        type: resourceType,
        id: _id
      }
    });
    Object.defineProperty(this, TARGET_DATA, {
      get: get_TARGET_DATA
    });

    Object.defineProperties(this, {
      active: {
        get: get_active
      },
      poolId: {
        get: get_poolId
      },
      resource: {
        get: get_resource
      },
      type: {
        get: get_type
      },
      id: {
        get: get_id
      }
    });
  }

  function get_TARGET_DATA() {
    return this.toJSON();
  }

  function get_active() {
    return Boolean(this[TARGET_INTERNALS].active);
  }

  function get_poolId() {
    return this[TARGET_INTERNALS].poolId;
  }

  function get_resource() {
    return this[TARGET_INTERNALS].resource;
  }

  function get_type() {
    return this[TARGET_INTERNALS].type || typeof(this[TARGET_INTERNALS].resource);
  }

  function get_id() {
    return this[TARGET_INTERNALS].id;
  }

  function _toJSON() {
    var data = {};
    data[TARGET_DATA] = {
      id: this[TARGET_INTERNALS].id,
      type: this.type,
      poolId: this.poolId
    };
    return data;
  }

  function _destroy() {
    var id = this[TARGET_INTERNALS].id;
    var pool = this[TARGET_INTERNALS].pool;

    if (!this[TARGET_INTERNALS].active) {
      return;
    }
    this[TARGET_INTERNALS].active = false;

    pool.remove(id);

    for (var name in this[TARGET_INTERNALS]) {
      delete this[TARGET_INTERNALS][name];
    }
  }

  TargetResource.prototype.toJSON = _toJSON;
  TargetResource.prototype.destroy = _destroy;

  function TargetResource_create(pool, target, targetType, id) {
    return new TargetResource(pool, target, targetType, id || getId());
  }

  TargetResource.create = TargetResource_create;

  return TargetResource;
})();
