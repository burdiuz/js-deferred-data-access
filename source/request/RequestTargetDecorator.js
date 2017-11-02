import CommandHandlerFactory from '../commands/CommandHandlerFactory';
import getResourceType from '../utils/getResourceType';

class RequestTargetDecorator {

  /**
   * @param {RequestFactory} factory
   * @param {RequestHandlers} handlers
   * @private
   */
  constructor(factory, handlers) {
    this.handlers = handlers;
    this.members = new CommandHandlerFactory(factory);
  }

  apply(request) {
    if (!this.handlers.available) {
      return request;
    }
    /* FIXME revert change when ES6 will be supported widely
     for (var descriptor of this.handlers) {
     request[descriptor.name] = this.getMember(descriptor.name, descriptor.type);
     }
     */
    /* FIXME Why no more iterators :(
    const iterator = this.handlers.getHandlers(getResourceType(request));
    let result;
    while (!(result = iterator.next()).done) {
      const descriptor = result.value;
      request[descriptor.name] = this.members.get(descriptor);
    }
    */
    const descriptors = this.handlers.getPropertyHandlers(getResourceType(request));
    const { length } = descriptors;
    for (let index = 0; index < length; index++) {
      const descriptor = descriptors[index];
      request[descriptor.name] = this.members.get(descriptor);
    }

    return request;
  }

  setFactory(factory) {
    if (factory) {
      this.members.setFactory(factory);
    }
  }
}

export const createRequestTargetDecorator = (factory, handlers) => (
  new RequestTargetDecorator(factory, handlers)
);

export default RequestTargetDecorator;
