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

    const descriptors = this.handlers.getPropertyHandlers(getResourceType(request));
    return descriptors.reduce((request, descriptor) => {
      request[descriptor.name] = this.members.get(descriptor);

      return request;
    }, request);
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
