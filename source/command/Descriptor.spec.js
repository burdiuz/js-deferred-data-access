import Descriptor, {
  createDescriptor,
  DEFAULT_IS_TEMPORARY,
  descriptorGeneratorFactory,
} from './Descriptor';

describe('Descriptor', () => {
  describe('When created', () => {
    describe('With all arguments', () => {
      let descriptor;
      let handler;

      beforeEach(() => {
        handler = () => {
        };
        descriptor = new Descriptor('command', handler, 'name');
      });

      it('should store arguments as fields', () => {
        expect(descriptor.name).to.be.equal('name');
        expect(descriptor.type).to.be.equal('command');
        expect(descriptor.handler).to.be.equal(handler);
        expect(descriptor.isTemporary).to.be.a('function');
        expect(descriptor.cacheable).to.be.true;
        expect(descriptor.virtual).to.be.false;
      });

      it('must have isTemporary initialized with default handler', () => {
        expect(descriptor.isTemporary).to.be.equal(DEFAULT_IS_TEMPORARY);
      });

      it('isTemporary must be TRUE by default', () => {
        expect(DEFAULT_IS_TEMPORARY()).to.be.true;
      });
    });

    describe('Without command', () => {
      let descriptor;

      beforeEach(() => {
        descriptor = new Descriptor('command', () => {
        });
      });

      it('should use type as "name" value', () => {
        expect(descriptor.name).to.be.equal(descriptor.type);
      });

      it('must have isTemporary initialized with default handler', () => {
        expect(descriptor.isTemporary).to.be.equal(DEFAULT_IS_TEMPORARY);
      });

      it('isTemporary must be TRUE by default', () => {
        expect(DEFAULT_IS_TEMPORARY()).to.be.true;
      });
    });

  });
});

describe('createDescriptor()', () => {
  let item;
  let handler;

  beforeEach(() => {
    handler = () => null;
  });

  describe('When using required arguments', () => {
    beforeEach(() => {
      item = createDescriptor('command', handler, 'name');
    });

    it('should create new instance of Descriptor', () => {
      expect(item).to.be.an.instanceof(Descriptor);
    });

    it('should apply specified parameters', () => {
      expect(item.type).to.be.equal('command');
      expect(item.handler).to.be.equal(handler);
      expect(item.name).to.be.equal('name');
      expect(item.isTemporary).to.be.equal(DEFAULT_IS_TEMPORARY);
      expect(item.resourceType).to.be.null;
      expect(item.cacheable).to.be.true;
      expect(item.virtual).to.be.false;
    });
  });
  describe('When using all arguments', () => {
    let isTemporary;

    beforeEach(() => {
      isTemporary = () => false;
      item = createDescriptor(
        'command',
        handler,
        'name',
        isTemporary,
        'MyResource',
        false,
        true,
      );
    });

    it('should create new instance of Descriptor', () => {
      expect(item).to.be.an.instanceof(Descriptor);
    });

    it('should apply specified parameters', () => {
      expect(item.type).to.be.equal('command');
      expect(item.name).to.be.equal('name');
      expect(item.handler).to.be.equal(handler);
      expect(item.isTemporary).to.be.equal(isTemporary);
      expect(item.resourceType).to.be.equal('MyResource');
      expect(item.cacheable).to.be.false;
      expect(item.virtual).to.be.true;
    });

    it('should freeze results', () => {
      expect(() => {
        item.name = null;
      }).to.throw(Error);

      expect(() => {
        item.type = null;
      }).to.throw(Error);

      expect(() => {
        delete item.handler;
      }).to.throw(Error);

    });
  });
});

describe('descriptorGeneratorFactory()', () => {
  let factory;
  let item;
  let handler;

  describe('When using required arguments', () => {

    beforeEach(() => {
      handler = () => {
      };
      factory = descriptorGeneratorFactory('command', 'name');
      item = factory(handler, null);
    });

    it('should create new instance of Descriptor', () => {
      expect(item).to.be.an.instanceof(Descriptor);
      expect(item).to.not.be.equal(factory(() => {
      }));
    });

    it('created descriptor should have all properties set', () => {
      expect(item.name).to.be.equal('name');
      expect(item.type).to.be.equal('command');
      expect(item.handler).to.be.equal(handler);
      expect(item.isTemporary).to.be.equal(DEFAULT_IS_TEMPORARY);
      expect(item.resourceType).to.be.null;
      expect(item.cacheable).to.be.true;
      expect(item.virtual).to.be.false;
    });
  });

  describe('When using all arguments', () => {
    let isTemporary;

    beforeEach(() => {
      handler = () => {
      };
      isTemporary = () => {
      };
      factory = descriptorGeneratorFactory('command', 'name');
      item = factory(handler, null, isTemporary, 'MyType', false, false);
    });

    it('should create new instance of Descriptor', () => {
      expect(item).to.be.an.instanceof(Descriptor);
      expect(item).to.not.be.equal(factory(() => {
      }));
    });

    it('created descriptor should have all properties set', () => {
      expect(item.name).to.be.equal('name');
      expect(item.type).to.be.equal('command');
      expect(item.handler).to.be.equal(handler);
      expect(item.isTemporary).to.be.equal(isTemporary);
      expect(item.resourceType).to.be.equal('MyType');
      expect(item.cacheable).to.be.false;
      expect(item.virtual).to.be.false;
    });
  });
});
