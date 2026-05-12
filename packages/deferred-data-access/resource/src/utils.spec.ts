import {
  getDefaultValidTargets,
  isValidTarget,
  setValidTargets,
} from './utils';

describe('getDefaultValidTargets', () => {
  it('should return array containing "object" and "function"', () => {
    const targets = getDefaultValidTargets();
    expect(targets).toContain('object');
    expect(targets).toContain('function');
  });

  it('should return a new array each time', () => {
    const a = getDefaultValidTargets();
    const b = getDefaultValidTargets();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe('isValidTarget', () => {
  beforeEach(() => {
    // Reset to defaults before each test
    setValidTargets(getDefaultValidTargets());
  });

  afterAll(() => {
    setValidTargets(getDefaultValidTargets());
  });

  it('should return true for objects', () => {
    expect(isValidTarget({})).toBe(true);
    expect(isValidTarget([])).toBe(true);
    expect(isValidTarget(null)).toBe(false); // typeof null === 'object' but null itself
  });

  it('should return true for functions', () => {
    expect(isValidTarget(() => {})).toBe(true);
    expect(isValidTarget(function named() {})).toBe(true);
  });

  it('should return false for primitives', () => {
    expect(isValidTarget(42)).toBe(false);
    expect(isValidTarget('string')).toBe(false);
    expect(isValidTarget(true)).toBe(false);
    expect(isValidTarget(undefined)).toBe(false);
    expect(isValidTarget(Symbol('sym'))).toBe(false);
  });
});

describe('setValidTargets', () => {
  afterAll(() => {
    setValidTargets(getDefaultValidTargets());
  });

  it('should change which types are considered valid', () => {
    setValidTargets(['number']);
    expect(isValidTarget(42)).toBe(true);
    expect(isValidTarget({})).toBe(false);
    expect(isValidTarget(() => {})).toBe(false);
  });

  it('should clear previous valid targets', () => {
    setValidTargets(['string']);
    expect(isValidTarget({})).toBe(false);
    expect(isValidTarget('hello')).toBe(true);
  });

  it('should allow empty array (nothing is valid)', () => {
    setValidTargets([]);
    expect(isValidTarget({})).toBe(false);
    expect(isValidTarget(() => {})).toBe(false);
    expect(isValidTarget(42)).toBe(false);
  });
});
