import { IdOwner } from '@actualwave/deferred-data-access/utils';
import { ResourcePool } from './resource-pool';

export class Resource extends IdOwner {
  constructor(
    public readonly pool: ResourcePool,
    public readonly type: string
  ) {
    super();
  }

  toObject() {
    return { id: this.id, poolId: this.pool.id, type: this.type };
  }

  toJSON() {
    return JSON.stringify(this.toObject());
  }
}

export const createResource = (
  pool: ResourcePool,
  target: unknown,
  type?: string
) => new Resource(pool, type || typeof target);

export const isResourceObject = (obj: { id: string; poolId: string }) =>
  obj &&
  // type signature is not enough for non-ts env
  typeof obj === 'object' &&
  typeof obj.id === 'string' &&
  typeof obj.poolId === 'string';
