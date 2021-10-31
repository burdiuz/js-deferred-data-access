import {
  initialize,
  createSubscriberFns,
  findEventEmitter,
  findMessagePort,
  InterfaceType,
} from '@actualwave/deferred-data-access/interface';
import { WIHostConfig, WIWorkerConfig } from './types';

export const initializeWorker = async ({
  worker,
  eventEmitter = findEventEmitter(worker),
  messagePort = findMessagePort(worker),
  ...params
}: WIWorkerConfig) =>
  initialize({
    ...params,
    type: InterfaceType.GUEST,
    sendMessage: (message) => (messagePort as MessagePort).postMessage(message),
    ...createSubscriberFns(eventEmitter),
  });

export const initializeHost = async ({
  worker, //: Worker | string
  ...params
}: WIHostConfig) => {
  let instance = worker;

  if (typeof worker === 'string') {
    if (typeof Worker === 'undefined') {
      throw new Error('Worker class is not available globally.');
    }

    instance = new Worker(worker);
  }

  return initialize({
    ...params,
    type: InterfaceType.HOST,
    sendMessage: (message) => (instance as MessagePort).postMessage(message),
    ...createSubscriberFns(instance),
  });
};
