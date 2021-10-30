import { ProxyWrapper, APIObject, API_PROP } from './types';

export const wrapWithProxy = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any,
  traps: { [key: string]: () => void },
  api: APIObject = {}
) => {
  const wrapper: ProxyWrapper = Object.assign(
    typeof target === 'function'
      ? function $RequestFn(this: any, ...args:[]) {
          return target.apply(this, args);
        }
      : function $Request() {
          // because
        },
    {
      target,
      [API_PROP]: { getTarget: () => target, ...api },
    }
  );

  return new Proxy(wrapper, traps);
};

export const isWrappedWithProxy = (obj: any): boolean =>
  !!(obj && obj[API_PROP]);

export const unwrapProxy = <T = unknown>(obj: any): T =>
  obj && obj[API_PROP] && (obj[API_PROP] as APIObject).getTarget() || obj;