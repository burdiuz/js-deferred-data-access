/**
 * Created by Oleg Galaburda on 07.03.16.
 */
var TargetResource = (function() {
  /**
   * The object that can be used to send Target to other side
   * @constructor
   */
  function TargetResource(_pool, _resource, _id) {
    Object.defineProperty(this, TARGET_INTERNALS, { // private read-only property
      value: {
        active: true,
        pool: _pool,
        resource: _resource,
        id: _id
      }
    });
    Object.defineProperty(this, TARGET_DATA, {
      get: function() {
        return this.toJSON();
      }
    });

    Object.defineProperties(this, {
      poolId: {
        get: function() {
          return this[TARGET_DATA].pool ? this[TARGET_DATA].pool.id : null;
        }
      },
      resource: {
        get: function() {
          return this[TARGET_DATA].resource;
        }
      },
      type: {
        get: function() {
          return typeof(this.resource);
        }
      },
      id: {
        get: function() {
          return this[TARGET_DATA].id;
        }
      }
    });
  }

  TargetResource.prototype.toJSON = function() {
    var data = {};
    data[TARGET_DATA] = {
      id: this.id,
      type: this.type,
      poolId: this.poolId
    };
    return data;
  };
  TargetResource.prototype.destroy = function() {
    if (!this[TARGET_INTERNALS].active) return;
    var id = this[TARGET_INTERNALS].id;
    var pool = this[TARGET_INTERNALS].pool;
    for (var name in this[TARGET_INTERNALS]) {
      delete this[TARGET_INTERNALS][name];
    }
    pool.remove(id);
  };

  return TargetResource;
})();
