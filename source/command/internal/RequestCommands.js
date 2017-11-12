import Descriptor, { addDescriptorTo } from '../Descriptor';

export const RequestCommandNames = Object.freeze({
  DESTROY: '::destroy.resource',
});

export const RequestCommandFields = Object.freeze({
  DESTROY: Symbol('::destroy.resource'),
});

/**
 * Destroy is unique type that exists for every Target
 * and does not have a method on its instances. This type will
 * be send each time Target.destroy() is applied to
 * Target in stance.
 */
class RequestCommands {
  constructor() {
    Object.freeze(this);
  }

  names = RequestCommandNames;
  fields = RequestCommandFields;

  createDESTROYDescriptor = (handler, target) => {
    const descriptor = new Descriptor(
      RequestCommandNames.DESTROY,
      handler,
      RequestCommandFields.DESTROY,
    );
    descriptor.cacheable = false;
    descriptor.virtual = true;
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };

}

export default new RequestCommands();
