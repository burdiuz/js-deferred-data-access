import { createDescriptor } from '../Descriptor';
import addDescriptorTo from '../descriptor/addDescriptorTo';
import ProxyPropertyNames from './ProxyPropertyNames';
import listProxyCommands from './listProxyCommands';

export default (
  handlers,
  target = {},
  isTemporary = undefined,
  resourceType = null,
  cacheable = true,
) => {
  const args = [isTemporary, resourceType, cacheable];
  listProxyCommands().forEach((name) => {
    const handler = handlers[name];
    // FIXME proxy commands could be virtual
    const field = ProxyPropertyNames[name];

    if (handler instanceof Function) {
      const descriptor = createDescriptor(name, handler, field, ...args);
      addDescriptorTo(Object.freeze(descriptor), target);
    }
  });

  return target;
};
