import { ProxyWrapper, APIObject, API_PROP } from './types';

export const wrapWithProxy = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any,
  traps: { [key: string]: () => void },
  api: APIObject = {}
) => {
  // Always use a function as the wrapper so the Proxy can intercept `apply`.
  // For non-function targets the wrapper body is intentionally empty — it is
  // never actually called; the apply trap intercepts all invocations first.
  const wrapper: ProxyWrapper = Object.assign(
    typeof target === 'function'
      ? function $RequestFn(this: any, ...args: unknown[]) {
          return target.apply(this, args);
        }
      : function $Request() {
          /* intentionally empty — apply trap handles all calls */
        },
    {
      target,
      [API_PROP]: { getTarget: () => target, ...api },
    }
  );

  return new Proxy(wrapper, traps);
};

export const isWrappedWithProxy = (obj: unknown): boolean =>
  obj != null && typeof obj === 'object' || typeof obj === 'function'
    ? !!(obj && (obj as any)[API_PROP])
    : false;

export const unwrapProxy = <T = unknown>(obj: unknown): T => {
  if (obj != null && (obj as any)[API_PROP]) {
    return ((obj as any)[API_PROP] as APIObject).getTarget() as T;
  }
  return obj as T;
};
