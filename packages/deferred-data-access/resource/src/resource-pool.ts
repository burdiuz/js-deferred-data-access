/* eslint-disable @typescript-eslint/ban-types */
import { IdOwner } from '@actualwave/deferred-data-access/utils';
import {
  WeakValueMap,
  type IFinalizationRegistryConstructor,
} from '@actualwave/weak-storage';
import { createResource, Resource } from './resource';
import { isValidTarget } from './utils';
import { getCustomFinalizationRegistryClass } from './finalization-registry';

export class ResourcePool extends IdOwner {
  // id → weakref(target): allows lookup by resource id
  private refs: WeakValueMap;

  constructor(
    FinalizationRegistry:
      | IFinalizationRegistryConstructor
      | null
      | undefined = getCustomFinalizationRegistryClass(),
  ) {
    super();
    this.refs = new WeakValueMap(FinalizationRegistry);
  }

  // target → Resource: allows lookup by target object
  private resources = new WeakMap();

  get active() {
    return !!this.resources;
  }

  set(target: object, type?: string): Resource | null {
    if (!isValidTarget(target)) {
      return null;
    }

    const existing = this.resources.get(target);

    if (existing) {
      return existing;
    }

    const resource = createResource(this, target, type);
    this.refs.set(resource.id, target);
    this.resources.set(target, resource);

    return resource;
  }

  /**
   * Returns true only when the target is registered AND its weakref is still
   * alive. Checks both maps to avoid the asymmetry where WeakMap.has() returns
   * true for a target whose WeakValueMap entry has already been collected.
   */
  has(target: object): boolean {
    if (!this.resources.has(target)) {
      return false;
    }
    const resource: Resource | undefined = this.resources.get(target);
    // Confirm the forward ref is still alive too
    return resource !== undefined && this.refs.get(resource.id) !== undefined;
  }

  get({ id }: { id: string }): unknown {
    return this.getById(id);
  }

  getById(id: string): unknown {
    return this.refs.get(id);
  }

  getResource(target: object): Resource | undefined {
    return this.resources.get(target);
  }

  remove(target: object): boolean {
    const resource: Resource | undefined = this.resources.get(target);

    if (resource) {
      this.refs.delete(resource.id);
      return this.resources.delete(target);
    }

    return false;
  }

  clear(): void {
    this.refs.forEach((_value, key) => {
      const target = this.refs.get(key);
      if (target !== undefined) {
        this.resources.delete(target);
      }
    });

    this.refs.clear();
  }
}
