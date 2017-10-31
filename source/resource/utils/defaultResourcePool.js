import ResourcePool from '../ResourcePool';

export class DefaultResourcePool extends ResourcePool {
  // INFO default ResourcePool should not be destroyable;
  destroy() {
    throw new Error('Default ResourcePool cannot be destroyed.');
  }
}

const defaultResourcePool = new DefaultResourcePool();

export default defaultResourcePool;
