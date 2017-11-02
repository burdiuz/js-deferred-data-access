import CommandDescriptor, { addDescriptorTo } from './CommandDescriptor';

export const RequestTargetCommandNames = Object.freeze({
  DESTROY: '::destroy.resource',
});

export const RequestTargetCommandFields = Object.freeze({
  DESTROY: Symbol('::destroy.resource'),
});

/**
 * Destroy is unique type that exists for every RequestTarget
 * and does not have a method on its instances. This type will
 * be send each time RequestTarget.destroy() is applied to
 * RequestTarget in stance.
 */
class RequestTargetCommands {
  constructor() {
    Object.freeze(this);
  }

  createDESTROYDescriptor = (handler, target) => {
    const descriptor = new CommandDescriptor(
      RequestTargetCommandNames.DESTROY,
      handler,
      RequestTargetCommandFields.DESTROY,
    );
    descriptor.cacheable = false;
    descriptor.virtual = true;
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };

}

export default new RequestTargetCommands();
