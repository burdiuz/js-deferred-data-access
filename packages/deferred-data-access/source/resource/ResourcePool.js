import EventDispatcher from 'event-dispatcher';
import getId from '../../../shared-utils/getId';
import isResource from '../utils/isResource';
import { createResource } from './Resource';
import isRequest from '../request/target/isRequest';

export const ResourcePoolEvents = Object.freeze({
  RESOURCE_ADDED: 'resourceAdded',
  RESOURCE_REMOVED: 'resourceRemoved',
  POOL_CLEAR: 'poolClear',
  POOL_CLEARED: 'poolCleared',
  POOL_DESTROYED: 'poolDestroyed',
});

export const MAP_FIELD = Symbol('ResourcePool::map');

let validTargets = {};

export const isValidTarget = (target) => (
  !isResource(target)
  && !isRequest(target)
  && Boolean(validTargets[typeof target])
);

export const setValidTargets = (list) => {
  validTargets = list.reduce((validTargets, target) => {
    validTargets[target] = true;

    return validTargets;
  }, {});
};

export const getDefaultValidTargets = () => ['object', 'function'];

class ResourcePool extends EventDispatcher {
  constructor() {
    super();
    this[MAP_FIELD] = new Map();
    Object.defineProperties(this, {
      id: {
        value: getId(),
      },
    });
  }

  set(value, type = null) {
    const map = this[MAP_FIELD];
    let resource = null;
    if (isValidTarget(value)) {
      if (map.has(value)) {
        resource = map.get(value);
      } else {
        resource = createResource(this, value, type || typeof value);
        map.set(resource.id, resource);
        map.set(value, resource);
        if (this.hasEventListener(ResourcePoolEvents.RESOURCE_ADDED)) {
          this.dispatchEvent(ResourcePoolEvents.RESOURCE_ADDED, resource);
        }
      }
    }

    return resource;
  }

  has(target) {
    return this[MAP_FIELD].has(target);
  }

  get(target) {
    return this[MAP_FIELD].get(target);
  }

  remove(value) {
    const map = this[MAP_FIELD];
    const resource = map.get(value);
    if (resource) {
      map.delete(resource.id);
      map.delete(resource.value);
      if (this.hasEventListener(ResourcePoolEvents.RESOURCE_REMOVED)) {
        this.dispatchEvent(ResourcePoolEvents.RESOURCE_REMOVED, resource);
      }
      resource.destroy();
    }
  }

  clear() {
    const map = this[MAP_FIELD];
    if (this.hasEventListener(ResourcePoolEvents.POOL_CLEAR)) {
      this.dispatchEvent(ResourcePoolEvents.POOL_CLEAR, this);
    }

    for (const [key, resource] of map) {
      if (typeof key === 'string' && key === resource.id) {
        resource.destroy();
      }
    }

    map.clear();

    if (this.hasEventListener(ResourcePoolEvents.POOL_CLEARED)) {
      this.dispatchEvent(ResourcePoolEvents.POOL_CLEARED, this);
    }
  }

  isActive() {
    return Boolean(this[MAP_FIELD]);
  }

  destroy() {
    this.clear();
    // intentionally make it not usable after its destroyed
    delete this[MAP_FIELD];
    if (this.hasEventListener(ResourcePoolEvents.POOL_DESTROYED)) {
      // FIXME why for second parameter?
      this.dispatchEvent(ResourcePoolEvents.POOL_DESTROYED, this);
    }
  }

  static events = ResourcePoolEvents;
}

class DefaultResourcePool extends ResourcePool {
  // INFO default ResourcePool should not be destroyable;
  destroy() {
    throw new Error('Default ResourcePool cannot be destroyed.');
  }
}

export const defaultResourcePool = new DefaultResourcePool();

export const createResourcePool = () => new ResourcePool();

setValidTargets(getDefaultValidTargets());

export default ResourcePool;
