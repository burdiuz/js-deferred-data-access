import { describe, it, expect, afterEach } from '@jest/globals';
import type { IFinalizationRegistryConstructor } from '@actualwave/weak-storage';
import {
  getCustomFinalizationRegistryClass,
  setCustomFinalizationRegistryClass,
} from './finalization-registry';

describe('finalization-registry', () => {
  afterEach(() => {
    setCustomFinalizationRegistryClass(undefined);
  });

  describe('getCustomFinalizationRegistryClass', () => {
    it('should return undefined by default', () => {
      expect(getCustomFinalizationRegistryClass()).toBeUndefined();
    });
  });

  describe('setCustomFinalizationRegistryClass', () => {
    it('should store and return a custom registry class', () => {
      const MockRegistry = class {} as unknown as IFinalizationRegistryConstructor;
      setCustomFinalizationRegistryClass(MockRegistry);
      expect(getCustomFinalizationRegistryClass()).toBe(MockRegistry);
    });

    it('should allow setting to null', () => {
      setCustomFinalizationRegistryClass(null);
      expect(getCustomFinalizationRegistryClass()).toBeNull();
    });

    it('should allow clearing with undefined', () => {
      const MockRegistry = class {} as unknown as IFinalizationRegistryConstructor;
      setCustomFinalizationRegistryClass(MockRegistry);
      setCustomFinalizationRegistryClass(undefined);
      expect(getCustomFinalizationRegistryClass()).toBeUndefined();
    });
  });
});
