import RequestCommands, {
  RequestCommandNames,
  RequestCommandFields,
} from './RequestCommands';

describe('RequestCommands', () => {
  describe('createDESTROYDescriptor()', () => {
    let handler;
    let descriptor;

    beforeEach(() => {
      handler = () => null;
      descriptor = RequestCommands.createDESTROYDescriptor(handler);
    });

    it('should has DESTROY name/type', () => {
      expect(descriptor.propertyName).to.be.equal(RequestCommandFields.DESTROY);
      expect(descriptor.command).to.be.equal(RequestCommandNames.DESTROY);
    });

    it('should store handler function ', () => {
      expect(descriptor.handler).to.be.equal(handler);
    });

    it('should create not cacheable descriptor', () => {
      expect(descriptor.cacheable).to.be.false;
    });

    it('should create virtual descriptor', () => {
      expect(descriptor.virtual).to.be.true;
    });
  });
});
