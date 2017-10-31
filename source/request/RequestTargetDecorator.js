import CommandHandlerFactory from '../commands/CommandHandlerFactory';
import { getResourceType } from '../resource';

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
    let result;

    if (!this.handlers.available) {
      return request;
    }
    /* FIXME revert change when ES6 will be supported widely
     for (var descriptor of this.handlers) {
     request[descriptor.name] = this.getMember(descriptor.name, descriptor.type);
     }
     */

    const iterator = this.handlers.getHandlers(getResourceType(request));
    while (!(result = iterator.next()).done) {
      const descriptor = result.value;
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

