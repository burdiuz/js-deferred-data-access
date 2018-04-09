import { createDescriptor } from '../Descriptor';
import addDescriptorTo from './addDescriptorTo';

export default (command, propertyName = undefined) =>
  (
    handler,
    target = {},
    isTemporary = null,
    resourceType = null,
    cacheable = true,
  ) => {
    const descriptor = createDescriptor(
      command,
      handler,
      propertyName,
      isTemporary,
      resourceType,
      cacheable,
    );

    addDescriptorTo(descriptor, target);
    return target;
  };
