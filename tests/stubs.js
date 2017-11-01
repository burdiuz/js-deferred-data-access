import TARGET_DATA from '../source/utils/TARGET_DATA';
import { createRequestTarget } from '../source/request/RequestTarget';
import { applyProxyWithDefaultHandlers } from '../source/request/RequestProxyFactory';
import { createTargetResource } from '../source/resource/TargetResource';

export const __createRequestTargetData = () => ({
  [TARGET_DATA]: {
    id: '1111',
    type: 'target-object',
    poolId: '22222',
  },
});

export const __createDataResolvedPromise = () => (
  Promise.resolve(__createRequestTargetData())
);

export const __createRequestTarget = (promise) => (
  createRequestTarget(promise !== undefined ? promise : __createDataResolvedPromise(), {})
);

export const __createRequestTargetProxy = (promise) => (
  applyProxyWithDefaultHandlers(createRequestTarget(
    promise !== undefined ? promise : __createDataResolvedPromise(),
    {},
  ))
);

export const __createTargetResourceData = () => ({
  [TARGET_DATA]: {
    id: '2222222',
    type: 'target-type',
    poolId: '111111',
  },
});

export const __createTargetResource = (resource) => (
  createTargetResource({ id: '111111' }, resource || {}, 'target-type', '2222222')
);
