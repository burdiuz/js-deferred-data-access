import Descriptor, {
  createDescriptor,
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
    });

  });
});

describe('createDescriptor()', () => {
  let item;

  beforeEach(() => {
    item = createDescriptor('command', () => {
    }, 'name');
  });
  it('should create new instance of Descriptor', () => {
    expect(item).to.be.an.instanceof(Descriptor);
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

describe('descriptorGeneratorFactory()', () => {
  let factory;
  let item;
  let handler;
  let isTemporary;

  beforeEach(() => {
    handler = () => {
    };
    isTemporary = () => {
    };
    factory = descriptorGeneratorFactory('command', 'name');
    item = factory(handler, null, isTemporary);
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
  });
});
