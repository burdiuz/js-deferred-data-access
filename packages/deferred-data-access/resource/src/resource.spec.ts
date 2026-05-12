import { Resource, createResource, isResourceObject, ResourceObject } from './resource';
import { ResourcePool } from './resource-pool';

describe('Resource', () => {
  let pool: ResourcePool;

  beforeEach(() => {
    pool = new ResourcePool();
  });

  describe('constructor', () => {
    it('should create a resource with pool and type', () => {
      const resource = new Resource(pool, 'object');
      expect(resource.pool).toBe(pool);
      expect(resource.type).toBe('object');
    });

    it('should auto-generate an id', () => {
      const r1 = new Resource(pool, 'function');
      const r2 = new Resource(pool, 'function');
      expect(typeof r1.id).toBe('string');
      expect(r1.id).not.toBe(r2.id);
    });

    it('should have readonly pool and type', () => {
      const resource = new Resource(pool, 'object');
      expect(() => {
        // @ts-expect-error testing readonly
        resource.pool = new ResourcePool();
      }).toThrow();
      expect(() => {
        // @ts-expect-error testing readonly
        resource.type = 'function';
      }).toThrow();
    });
  });

  describe('toObject', () => {
    it('should return an object with id, poolId, and type', () => {
      const resource = new Resource(pool, 'function');
      const obj = resource.toObject();
      expect(obj.id).toBe(resource.id);
      expect(obj.poolId).toBe(pool.id);
      expect(obj.type).toBe('function');
    });

    it('should return a plain object', () => {
      const resource = new Resource(pool, 'object');
      const obj = resource.toObject();
      expect(obj.constructor).toBe(Object);
    });
  });

  describe('toJSON', () => {
    it('should return a valid JSON string', () => {
      const resource = new Resource(pool, 'object');
      const json = resource.toJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should serialize id, poolId, and type', () => {
      const resource = new Resource(pool, 'function');
      const parsed = JSON.parse(resource.toJSON());
      expect(parsed.id).toBe(resource.id);
      expect(parsed.poolId).toBe(pool.id);
      expect(parsed.type).toBe('function');
    });
  });
});

describe('createResource', () => {
  let pool: ResourcePool;

  beforeEach(() => {
    pool = new ResourcePool();
  });

  it('should create a Resource with pool and inferred type', () => {
    const target = {};
    const resource = createResource(pool, target);
    expect(resource).toBeInstanceOf(Resource);
    expect(resource.pool).toBe(pool);
    expect(resource.type).toBe('object');
  });

  it('should use provided type when given', () => {
    const target = {};
    const resource = createResource(pool, target, 'myCustomType');
    expect(resource.type).toBe('myCustomType');
  });

  it('should infer type from target for functions', () => {
    const target = () => {};
    const resource = createResource(pool, target);
    expect(resource.type).toBe('function');
  });

  it('should infer type from target for strings', () => {
    const resource = createResource(pool, 'hello');
    expect(resource.type).toBe('string');
  });
});

describe('isResourceObject', () => {
  it('should return true for valid ResourceObject shape', () => {
    const obj: ResourceObject = { id: 'res-1', poolId: 'pool-1', type: 'object' };
    expect(isResourceObject(obj)).toBe(true);
  });

  it('should return false if id is not a string', () => {
    expect(isResourceObject({ id: 123, poolId: 'pool-1', type: 'object' })).toBe(false);
  });

  it('should return false if poolId is not a string', () => {
    expect(isResourceObject({ id: 'res-1', poolId: null, type: 'object' })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isResourceObject(null)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isResourceObject('string')).toBe(false);
    expect(isResourceObject(42)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isResourceObject({})).toBe(false);
  });
});
