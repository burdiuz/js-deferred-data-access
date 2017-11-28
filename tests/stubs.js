import TARGET_DATA from '../source/utils/TARGET_DATA';
import { createRequestTarget } from '../source/request/Target';
import { applyProxyWithDefaultHandlers } from '../source/request/ProxyFactory';
import { createResource } from '../source/resource/Resource';
import { ProxyCommandFields } from "../source/command/internal/ProxyCommands";

export const __createRequestData = (data = {}) => ({
  [TARGET_DATA]: {
    $id: '1111',
    $type: 'target-object',
    $poolId: '22222',
    ...data,
  },
});

export const __createDataResolvedPromise = (data = {}) => (
  Promise.resolve(__createRequestData(data))
);

export const __createRequest = (promise, data = {}) => (
  createRequestTarget(promise !== undefined ? promise : __createDataResolvedPromise(data), {})
);

export const __createRequestProxy = (
  promise,
  get = () => undefined, // null's are type coerced to 'object'
  set = () => undefined,
  apply = () => undefined,
  deleteProperty = () => undefined,
) => {
  const target = createRequestTarget(
    promise !== undefined ? promise : __createDataResolvedPromise(),
    {},
  );
  target[ProxyCommandFields.get] = get;
  target[ProxyCommandFields.set] = set;
  target[ProxyCommandFields.apply] = apply;
  target[ProxyCommandFields.deleteProperty] = deleteProperty;
  return applyProxyWithDefaultHandlers(target);
};

export const __createResourceData = (data = {}) => ({
  [TARGET_DATA]: {
    $id: '2222222',
    $type: 'target-type',
    $poolId: '111111',
    ...data,
  },
});

export const __createResource = (resource = {}, pool = { id: '111111' }, resourceType = 'target-type', id = '2222222') => (
  createResource(pool, resource, resourceType, id)
);
