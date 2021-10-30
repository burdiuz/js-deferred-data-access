const validTargets = new Set();

export const getDefaultValidTargets = () => ['object', 'function'];

export const isValidTarget = (value: unknown): boolean => validTargets.has(typeof value);

export const setValidTargets = (list: unknown[]): void => {
  validTargets.clear();
  list.forEach((item) => validTargets.add(item));
};

setValidTargets(getDefaultValidTargets());
