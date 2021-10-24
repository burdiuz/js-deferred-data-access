/* eslint-disable @typescript-eslint/ban-types */
import { IdOwner } from '@actualwave/deferred-data-access/utils';
import { WeakValueMap } from '@actualwave/weak-storage';
import { createResource, Resource } from './resource';
import { isValidTarget } from './utils';

export class ResourcePool extends IdOwner {
  // { [string]: weakref }
  private refs = new WeakValueMap();

  // { [weakref]: Resource }
  private resources = new WeakMap();

  get active() {
    return !!this.resources;
  }

  set(target: object, type?: string): Resource | null {
    let resource = null;

    if (!isValidTarget(target)) {
      return resource;
    }

    resource = this.resources.get(target);

    if (!resource) {
      resource = createResource(this, target, type);
      this.refs.set(resource.id, target);
      this.resources.set(target, resource);
    }

    return resource;
  }

  has(target: object) {
    return this.resources.has(target);
  }

  get({ id }: { id: string }): unknown {
    return this.getById(id);
  }

  getById(id: string): unknown {
    return this.refs.get(id);
  }

  getResource(target: object): Resource {
    return this.resources.get(target);
  }

  remove(target: object): boolean {
    const resource = this.resources.get(target);

    if (resource) {
      this.refs.delete(resource.id);
      return this.resources.delete(target);
    }

    return false;
  }

  clear() {
    for (const key of this.refs.keys()) {
      const target = this.refs.get(key);
      this.resources.delete(target);
    }

    this.refs.clear();
  }
}
