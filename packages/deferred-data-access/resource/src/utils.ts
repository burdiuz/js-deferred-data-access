// Valid target types are scoped per-module and intentionally not shared across
// ResourcePool instances. If you need per-pool validity rules, pass a custom
// isValidTarget predicate into ResourcePool directly.
const validTargets = new Set<string>();

export const getDefaultValidTargets = (): string[] => ['object', 'function'];

export const isValidTarget = (value: unknown): boolean => {
  // typeof null === 'object' but null cannot be used as a WeakMap key
  if (value === null) return false;
  return validTargets.has(typeof value);
};

export const setValidTargets = (list: string[]): void => {
  validTargets.clear();
  list.forEach((item) => validTargets.add(item));
};

setValidTargets(getDefaultValidTargets());
