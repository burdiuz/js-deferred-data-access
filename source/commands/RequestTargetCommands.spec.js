import RequestTargetCommands, {
  RequestTargetCommandNames,
  RequestTargetCommandFields,
} from './RequestTargetCommands';

describe('RequestTargetCommands', () => {
  describe('createDESTROYDescriptor()', () => {
    let handler;
    let descriptor;

    beforeEach(() => {
      handler = () => {
      };
      descriptor = RequestTargetCommands.createDESTROYDescriptor(handler);
    });

    it('should has DESTROY name/type', () => {
      expect(descriptor.name).to.be.equal(RequestTargetCommandFields.DESTROY);
      expect(descriptor.type).to.be.equal(RequestTargetCommandNames.DESTROY);
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
