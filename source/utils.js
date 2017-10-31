export const TargetStatus = Object.freeze({
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DESTROYED: 'destroyed',
});

/**
 * @type {Symbol}
 * @private
 */
export const TARGET_INTERNALS = Symbol('request.target:internals');
/**
 *
 * @type {string}
 * @private
 */
export const TARGET_DATA = 'resource::data';

/**
 * @private
 */
export const getId = (() => {
  const base = `DA/${Date.now()}/`;
  let index = 0;
  return () => `${base}${++index}/${Date.now()}`;
})();

/**
 * @constructor
 * @alias DataAccessInterface.Deferred
 */
export class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

/**
 * @returns {Deferred}
 * @private
 */
export const createDeferred = () => new Deferred();

/**
 * @returns {boolean}
 * @private
 */
export const areProxiesAvailable = () => (typeof Proxy === 'function');
