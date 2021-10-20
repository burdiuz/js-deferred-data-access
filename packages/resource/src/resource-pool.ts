import { IdOwner } from '@actualwave/deferred-data-access/utils';
import { WeakStorage } from '@actualwave/weak-storage';
import { isValidTarget } from './utils';

export class ResourcePool extends IdOwner {
  // { [string]: weakref }
  private refs = new WeakStorage();

  // { [weakref]: Resource }
  private resources = new WeakMap();

  get active() {
    return !!this.resources;
  }

  set(target: any, type: string = '') {
    let resource = null;

    if (!isValidTarget(target)) {
      return resource;
    }

    resource = this.resources.get(target);

    if(!resource) {
      resource = createResource(this, target, type || typeof target);
      this.refs.set(resource.id, target);
      this.resources.set(target, resource);
    }

    return resource;
  }

  has(target:any) {
    return this.resources.has(target);
  }
  
  get(target:any) {
    return this.resources.get(target);
  }
  
  remove(target:any) {
    var resource = this.resources.get(target);
  
    if (resource) {
      this.refs.delete(resource.id);
      this.resources.delete(resource.resource);
      resource.destroy();
    }
  }
  
  clear() {
    let key;
    var keys = this.map.keys();
    //FIXME update to for...of loop when it comes to browsers
    while (!(key = keys.next()).done) {
      if (typeof key.value === 'string') {
        var resource = this.map.get(key.value);
        resource.destroy();
      }
    }
    this.map.clear();
  }

  destroy() {
    this.clear();
    delete this.refs;
    delete this.resources;
  }
