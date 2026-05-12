import { PropertyName } from './types';

// Subtract a small random offset so IDs generated in the same millisecond
// across separate module loads remain unique.
const DATE_NOW = Date.now() - Math.floor(Math.random() * 1000);
let index = 0;

export enum ReservedPropertyNames {
  THEN = 'then',
  CATCH = 'catch',
}

/**
 * Returns true only for string property names that match reserved Promise
 * method names. Symbol names are never reserved — they always pass through
 * to the proxy handler.
 */
export const isReservedPropertyName = (name: PropertyName): boolean =>
  typeof name === 'string' &&
  (name === ReservedPropertyNames.THEN || name === ReservedPropertyNames.CATCH);

/**
 * Returns a rejected Promise. Throws the message as a value (not an Error
 * instance) to preserve the original behaviour expected by callers.
 */
export const reject = (message: string): Promise<never> =>
  Promise.reject(message);

/**
 * Returns a function that generates monotonically increasing unique IDs.
 * All generators in this module share the same counter so IDs are globally
 * unique within a single process.
 *
 * @param key - Optional namespace prefix included in every generated ID.
 */
export const createUIDGenerator = (key = ''): () => string => {
  const prefix = `${key ? `${key}/` : ''}${DATE_NOW}/`;
  return () => `${prefix}${++index};`;
};

export const generateId = createUIDGenerator();

export class IdOwner {
  readonly id: string;

  constructor(id: string = generateId()) {
    this.id = id;
    // Prevent external mutation while remaining compatible with subclasses
    // that call super() without explicitly sealing.
    Object.defineProperty(this, 'id', {
      value: this.id,
      writable: false,
      configurable: false,
    });
  }
}
