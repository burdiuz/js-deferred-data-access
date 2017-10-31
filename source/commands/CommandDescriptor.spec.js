import CommandDescriptor, {
  createCommandDescriptor,
  descriptorGeneratorFactory,
} from './CommandDescriptor';

describe('CommandDescriptor', () => {
  describe('When created', () => {
    describe('With all arguments', () => {
      let descriptor;
      let handler;

      beforeEach(() => {
        handler = () => {
        };
        descriptor = new CommandDescriptor('command', handler, 'name');
      });

      it('should store arguments as fields', () => {
        expect(descriptor.name).to.be.equal('name');
        expect(descriptor.type).to.be.equal('command');
        expect(descriptor.handler).to.be.equal(handler);
        expect(descriptor.isTemporary).to.be.null;
        expect(descriptor.cacheable).to.be.false;
        expect(descriptor.virtual).to.be.false;
      });
    });

    describe('Without command', () => {
      let descriptor;

      beforeEach(() => {
        descriptor = new CommandDescriptor('command', () => {
        });
      });

      it('should use type as "name" value', () => {
        expect(descriptor.name).to.be.equal(descriptor.type);
      });
    });

  });
});

describe('createCommandDescriptor()', () => {
  let item;

  beforeEach(() => {
    item = createCommandDescriptor('command', () => {
    }, 'name');
  });
  it('should create new instance of CommandDescriptor', () => {
    expect(item).to.be.an.instanceof(CommandDescriptor);
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

  it('should create new instance of CommandDescriptor', () => {
    expect(item).to.be.an.instanceof(CommandDescriptor);
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
