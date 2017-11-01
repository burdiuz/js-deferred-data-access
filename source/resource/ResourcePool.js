import EventDispatcher from 'event-dispatcher';
import getId from '../utils/getId';
import isResource from '../utils/isResource';
import { createTargetResource } from './TargetResource';

export const ResourcePoolEvents = Object.freeze({
  RESOURCE_ADDED: 'resourceAdded',
  RESOURCE_REMOVED: 'resourceRemoved',
  POOL_CLEAR: 'poolClear',
  POOL_CLEARED: 'poolCleared',
  POOL_DESTROYED: 'poolDestroyed',
});

const MAP_FIELD = Symbol('ResourcePool::map');

let validTargets = {};

export const isValidTarget = (target) => (
  !isResource(target)
  && Boolean(validTargets[typeof target])
);

export const setValidTargets = (list) => {
  validTargets = {};
  const { length } = list;
  for (let index = 0; index < length; index++) {
    validTargets[list[index]] = true;
  }
};

export const getDefaultValidTargets = () => ['object', 'function'];

class ResourcePool extends EventDispatcher {
  [MAP_FIELD] = new Map();

  constructor() {
    super();
    Object.defineProperties(this, {
      id: {
        value: getId(),
      },
    });
  }

  set(target, type) {
    let link = null;
    if (isValidTarget(target)) {
      if (this[MAP_FIELD].has(target)) {
        link = this[MAP_FIELD].get(target);
      } else {
        link = createTargetResource(this, target, type || typeof target);
        this[MAP_FIELD].set(link.id, link);
        this[MAP_FIELD].set(target, link);
        if (this.hasEventListener(ResourcePoolEvents.RESOURCE_ADDED)) {
          this.dispatchEvent(ResourcePoolEvents.RESOURCE_ADDED, link);
        }
      }
    }
    return link;
  }

  has(target) {
    return this[MAP_FIELD].has(target);
  }

  get(target) {
    return this[MAP_FIELD].get(target);
  }

  remove(target) {
    const link = this[MAP_FIELD].get(target);
    if (link) {
      this[MAP_FIELD].delete(link.id);
      this[MAP_FIELD].delete(link.resource);
      if (this.hasEventListener(ResourcePoolEvents.RESOURCE_REMOVED)) {
        this.dispatchEvent(ResourcePoolEvents.RESOURCE_REMOVED, link);
      }
      link.destroy();
    }
  }

  clear() {
    if (this.hasEventListener(ResourcePoolEvents.POOL_CLEAR)) {
      this.dispatchEvent(ResourcePoolEvents.POOL_CLEAR, this);
    }
    let key;
    const keys = this[MAP_FIELD].keys();
    // FIXME update to for...of loop when it comes to browsers
    while (!(key = keys.next()).done) {
      if (typeof key.value === 'string') {
        const link = this[MAP_FIELD].get(key.value);
        link.destroy();
      }
    }
    this[MAP_FIELD].clear();
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
