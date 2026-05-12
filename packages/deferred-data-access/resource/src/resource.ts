import { IdOwner } from '@actualwave/deferred-data-access/utils';
import { ResourcePool } from './resource-pool';

export class Resource extends IdOwner {
  constructor(
    public readonly pool: ResourcePool,
    public readonly type: string
  ) {
    super();
    Object.defineProperty(this, 'pool', { value: pool, writable: false, configurable: false });
    Object.defineProperty(this, 'type', { value: type, writable: false, configurable: false });
  }

  toObject(): ResourceObject {
    return { id: this.id, poolId: this.pool.id, type: this.type };
  }

  toJSON() {
    return JSON.stringify(this.toObject());
  }
}

export type ResourceObject = {
  id: string;
  poolId: string;
  type: string;
};

export const createResource = (
  pool: ResourcePool,
  target: unknown,
  type?: string
) => new Resource(pool, type || typeof target);

export const isResourceObject = (obj: unknown): obj is ResourceObject =>
  obj != null &&
  typeof obj === 'object' &&
  typeof (obj as Record<string, unknown>).id === 'string' &&
  typeof (obj as Record<string, unknown>).poolId === 'string';
