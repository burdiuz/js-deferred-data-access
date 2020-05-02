import ResourcePool from './ResourcePool';

class DefaultResourcePool extends ResourcePool {
  // INFO default ResourcePool should not be destroyable;
  destroy() {
    throw new Error('Default ResourcePool cannot be destroyed.');
  }
}

export default new DefaultResourcePool();
