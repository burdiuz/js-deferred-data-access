import TARGET_DATA from '../source/utils/TARGET_DATA';
import { createRequestTarget } from '../source/request/Target';
import { applyProxyWithDefaultHandlers } from '../source/request/ProxyFactory';
import { createResource } from '../source/resource/Resource';

export const __createRequestData = () => ({
  [TARGET_DATA]: {
    $id: '1111',
    $type: 'target-object',
    $poolId: '22222',
  },
});

export const __createDataResolvedPromise = () => (
  Promise.resolve(__createRequestData())
);

export const __createRequest = (promise) => (
  createRequestTarget(promise !== undefined ? promise : __createDataResolvedPromise(), {})
);

export const __createRequestProxy = (promise) => (
  applyProxyWithDefaultHandlers(createRequestTarget(
    promise !== undefined ? promise : __createDataResolvedPromise(),
    {},
  ))
);

export const __createResourceData = () => ({
  [TARGET_DATA]: {
    $id: '2222222',
    $type: 'target-type',
    $poolId: '111111',
  },
});

export const __createResource = (resource) => (
  createResource({ id: '111111' }, resource || {}, 'target-type', '2222222')
);
