import Descriptor from '../Descriptor';
import addDescriptorTo from '../descriptor/addDescriptorTo';
import RequestCommandNames from './RequestCommandNames';
import RequestPropertyNames from './RequestPropertyNames';

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

  createDESTROYDescriptor = (handler, target) => {
    const descriptor = new Descriptor(
      RequestCommandNames.DESTROY,
      handler,
      // FIXME "destroy" command could be virtual
      RequestPropertyNames.DESTROY,
    );
    descriptor.cacheable = false;
    // FIXME ^^^ look above
    descriptor.virtual = true;
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };

}

export default new RequestCommands();
