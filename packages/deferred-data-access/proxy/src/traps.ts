import { PropertyName } from '@actualwave/deferred-data-access/utils';
import { ProxyCommand } from './command';
import { EXCLUSIONS, ProxyWrapper, ProxyHandler } from './types';
import { isNameExcluded, isNameSymbol } from './utils';

const createGetTrap =
  (handler: ProxyHandler) => (wrapper: ProxyWrapper, name: PropertyName) => {
    const { target } = wrapper;

    if (isNameExcluded(name)) {
      return (wrapper as any)[name];
    }

    // We expect that user of the lib will wrap with Proxy explicitly whatever they want
    return handler(ProxyCommand.GET, name, undefined, target);
  };

const createApplyTrap =
  (handler: ProxyHandler) =>
  ({ target }: ProxyWrapper, thisValue: never, args: never[]) => {
    // thisValue is being ignored for now
    // target is a function that should be applied
    return handler(ProxyCommand.APPLY, undefined, args, target);
  };

const createSetTrap =
  (handler: ProxyHandler) =>
  ({ target }: ProxyWrapper, name: PropertyName, value: any): boolean => {
    if (isNameExcluded(name)) {
      return false;
    }

    /* TODO why this might be needed?
    if (isNameSymbol(name)) {
      target.then((context: any) => {
        context[name] = value;
      });

      return false;
    }
    */

    handler(ProxyCommand.SET, name, value, target);
    return true;
  };

const createDeletePropertyTrap =
  (handler: ProxyHandler) => (wrapper: ProxyWrapper, name: PropertyName) => {
    if (isNameExcluded(name)) {
      return false;
    }

    handler(ProxyCommand.DELETE_PROPERTY, name, undefined, wrapper.target);
    return true;
  };

const proxyHasTrap = (wrapper: ProxyWrapper, name: PropertyName): boolean => {
  if (isNameExcluded(name)) {
    return (wrapper as any)[name];
  }

  // because of this Promise does not call ProxyWrapper.then() and just returns it.
  // if change to true, it will subscribe to ProxyWrapper.then() and wait for it to resolve
  return false;
};

const proxyOwnKeysTrap = () => Object.getOwnPropertyNames(EXCLUSIONS);

// INFO You cannot enumerate properties of request object, this may possibly require processing a lot of data
const proxyEnumerateTrap = () =>
  Object.getOwnPropertyNames(EXCLUSIONS)[Symbol.iterator]();

const proxyGetOwnPropertyDescriptorTrap = (
  wrapper: ProxyWrapper,
  name: PropertyName
) => {
  if (isNameExcluded(name)) {
    return Object.getOwnPropertyDescriptor(wrapper, name);
  }

  return Object.getOwnPropertyDescriptor(wrapper.target, name);
};

export const createProxyTrapsObject = (
  handler: ProxyHandler
): { [key: string]: (...args: never[]) => unknown } => ({
  get: createGetTrap(handler),
  apply: createApplyTrap(handler),
  set: createSetTrap(handler),
  deleteProperty: createDeletePropertyTrap(handler),
  has: proxyHasTrap,
  ownKeys: proxyOwnKeysTrap,
  enumerate: proxyEnumerateTrap,
  getOwnPropertyDescriptor: proxyGetOwnPropertyDescriptorTrap,
});
