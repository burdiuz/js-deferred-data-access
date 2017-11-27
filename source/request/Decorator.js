import CallbackFactory from '../command/CallbackFactory';
import getResourceType from '../utils/getResourceType';

class Decorator {
  constructor(factory, handlers) {
    this.handlers = handlers;
    this.members = new CallbackFactory(factory);
  }

  apply(request) {
    if (!this.handlers.available) {
      return request;
    }

    const descriptors = this.handlers.getPropertyCommands(getResourceType(request));
    return descriptors.forEach((descriptor) => {
      request[descriptor.propertyName] = this.members.get(descriptor);
    });
  }

  setFactory(factory) {
    if (factory) {
      this.members.setFactory(factory);
    }
  }
}

export const createDecorator = (factory, handlers) => (
  new Decorator(factory, handlers)
);

export default Decorator;
