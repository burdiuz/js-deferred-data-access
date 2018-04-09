import EventDispatcher from '@actualwave/event-dispatcher';
import generateId from './utils/generateId';
import isResource from './resource/isResource';
import createResource from './createResource';

let validTargets = {};

export const isValidTarget = (target) => (
  !isResource(target)
  && Boolean(validTargets[typeof target])
);

export const setValidTargets = (list) => {
  validTargets = list.reduce((targets, target) => {
    targets[target] = true;

    return targets;
  }, {});
};

export const getDefaultValidTargets = () => ['object', 'function'];

class ResourcePool extends EventDispatcher {
  static RESOURCE_ADDED = 'resourceAdded';
  static RESOURCE_REMOVED = 'resourceRemoved';
  static POOL_CLEAR = 'poolClear';
  static POOL_CLEARED = 'poolCleared';
  static POOL_DESTROYED = 'poolDestroyed';

  resources = new Map();

  constructor() {
    super();
    Object.defineProperties(this, {
      id: {
        value: generateId(),
      },
    });
  }

  set(value, type = null) {
    const map = this.resources;
    let resource = null;

    if (!isValidTarget(value)) {
      return null;
    }

    if (map.has(value)) {
      resource = map.get(value);
    } else {
      resource = createResource(this, value, type || typeof value);
      map.set(resource.id, resource);
      map.set(value, resource);
      if (this.hasEventListener(ResourcePool.RESOURCE_ADDED)) {
        this.dispatchEvent(ResourcePool.RESOURCE_ADDED, resource);
      }
    }

    return resource;
  }

  has(target) {
    return this.resources.has(target);
  }

  get(target) {
    return this.resources.get(target);
  }

  remove(value) {
    const map = this.resources;
    const resource = map.get(value);
    if (resource) {
      map.delete(resource.id);
      map.delete(resource.value);

      if (this.hasEventListener(ResourcePool.RESOURCE_REMOVED)) {
        this.dispatchEvent(ResourcePool.RESOURCE_REMOVED, resource);
      }

      resource.destroy();
    }
  }

  clear() {
    const map = this.resources;

    if (this.hasEventListener(ResourcePool.POOL_CLEAR)) {
      this.dispatchEvent(ResourcePool.POOL_CLEAR, this);
    }

    for (const [key, resource] of map) {
      if (typeof key === 'string' && key === resource.id) {
        resource.destroy();
      }
    }

    map.clear();

    if (this.hasEventListener(ResourcePool.POOL_CLEARED)) {
      this.dispatchEvent(ResourcePool.POOL_CLEARED, this);
    }
  }

  isActive() {
    return Boolean(this.resources);
  }

  destroy() {
    this.clear();
    // intentionally make it not usable after its destroyed
    delete this.resources;
    if (this.hasEventListener(ResourcePool.POOL_DESTROYED)) {
      this.dispatchEvent(ResourcePool.POOL_DESTROYED, this);
    }
  }
}

export default ResourcePool;
