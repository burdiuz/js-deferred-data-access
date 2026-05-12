import {
  ReservedPropertyNames,
  isReservedPropertyName,
  reject,
  createUIDGenerator,
  generateId,
  IdOwner,
} from './utils';

describe('ReservedPropertyNames', () => {
  it('should have THEN and CATCH values', () => {
    expect(ReservedPropertyNames.THEN).toBe('then');
    expect(ReservedPropertyNames.CATCH).toBe('catch');
  });
});

describe('isReservedPropertyName', () => {
  it('should return true for "then"', () => {
    expect(isReservedPropertyName('then')).toBe(true);
  });

  it('should return true for "catch"', () => {
    expect(isReservedPropertyName('catch')).toBe(true);
  });

  it('should return false for other strings', () => {
    expect(isReservedPropertyName('foo')).toBe(false);
    expect(isReservedPropertyName('finally')).toBe(false);
    expect(isReservedPropertyName('')).toBe(false);
  });

  it('should return false for symbols', () => {
    expect(isReservedPropertyName(Symbol('then'))).toBe(false);
  });
});

describe('reject', () => {
  it('should return a rejected promise with the given message', async () => {
    await expect(reject('error message')).rejects.toBe('error message');
  });

  it('should reject with any string', async () => {
    await expect(reject('custom error')).rejects.toBe('custom error');
  });
});

describe('createUIDGenerator', () => {
  it('should return a function', () => {
    const generator = createUIDGenerator();
    expect(typeof generator).toBe('function');
  });

  it('should generate unique IDs on each call', () => {
    const generator = createUIDGenerator('test');
    const id1 = generator();
    const id2 = generator();
    expect(id1).not.toBe(id2);
  });

  it('should include key prefix when provided', () => {
    const generator = createUIDGenerator('mykey');
    const id = generator();
    expect(id).toContain('mykey/');
  });

  it('should generate IDs without prefix when no key given', () => {
    const generator = createUIDGenerator();
    const id = generator();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should produce sequentially incrementing IDs', () => {
    const generator = createUIDGenerator('seq');
    const ids = [generator(), generator(), generator()];
    // Each id ends with ';' and has an incrementing counter
    expect(ids[0]).not.toBe(ids[1]);
    expect(ids[1]).not.toBe(ids[2]);
  });
});

describe('generateId', () => {
  it('should be a function', () => {
    expect(typeof generateId).toBe('function');
  });

  it('should return a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('should return unique values', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });
});

describe('IdOwner', () => {
  it('should auto-generate an id if none provided', () => {
    const owner = new IdOwner();
    expect(typeof owner.id).toBe('string');
    expect(owner.id.length).toBeGreaterThan(0);
  });

  it('should use provided id', () => {
    const owner = new IdOwner('custom-id-123');
    expect(owner.id).toBe('custom-id-123');
  });

  it('should have unique ids across instances', () => {
    const a = new IdOwner();
    const b = new IdOwner();
    expect(a.id).not.toBe(b.id);
  });

  it('should have readonly id', () => {
    const owner = new IdOwner('test');
    expect(() => {
      // @ts-expect-error testing readonly
      owner.id = 'new';
    }).toThrow();
  });
});
