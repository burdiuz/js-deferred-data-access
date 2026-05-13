import { IFinalizationRegistryConstructor } from '@actualwave/weak-storage';

let finalizationRegistryClass:
  | IFinalizationRegistryConstructor
  | null
  | undefined;

/**
 * Returns class of a custom FinalizationRegistry if set with setCustomFinalizationRegistryClass()
 * @returns {IFinalizationRegistryConstructor}
 */
export const getCustomFinalizationRegistryClass = ():
  | IFinalizationRegistryConstructor
  | null
  | undefined => {
  return finalizationRegistryClass;
};

/**
 * Allows to setup custom FinalizationRegistry in environments where
 * it is not available natively. It is used to cleanup stored weak 
 * references in ResourcePools.
 * @param definition FinalizationRegistry, its mock or polyfill, etc.
 */
export const setCustomFinalizationRegistryClass = (
  definition: IFinalizationRegistryConstructor | null | undefined,
): void => {
  finalizationRegistryClass = definition;
};
