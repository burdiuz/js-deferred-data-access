import Descriptor from '../Descriptor';
import ProxyCommands, {
  ProxyCommandFields,
  ProxyCommandNames,
  createDescriptors,
} from './ProxyCommands';

describe('ProxyCommands', () => {
  describe('list', () => {
    it('should contain all Proxy commands', () => {
      const { list } = ProxyCommands;
      for (const name in ProxyCommands) {
        const command = ProxyCommandNames[name];
        if (typeof (command) === 'string') {
          expect(list).to.contain(command);
        }
      }
    });

    it('should be read-only', () => {
      const { list: { length } } = ProxyCommands;
      ProxyCommands.list.shift();
      expect(length).to.be.equal(ProxyCommands.list.length);
    });
  });

  describe('createGETDescriptor()', () => {
    let descriptor;
    let handler;
    let isTemporary;

    beforeEach(() => {
      handler = () => {
      };
      isTemporary = () => {
      };
      descriptor = ProxyCommands.createGETDescriptor(handler, null, isTemporary);
    });

    it('should contain Proxy GET property name', () => {
      expect(descriptor.name).to.be.equal(ProxyCommandFields.get);
    });

    it('should contain Proxy GET commant type', () => {
      expect(descriptor.type).to.be.equal(ProxyCommandNames.GET);
    });

    it('should contain handler function', () => {
      expect(descriptor.handler).to.be.equal(handler);
    });

    it('should not be virtual', () => {
      expect(descriptor.virtual).to.be.false;
    });

    it('should contain isTemporary function', () => {
      expect(descriptor.isTemporary).to.be.equal(isTemporary);
    });

    it('should be cacheable', () => {
      expect(descriptor.cacheable).to.be.true;
    });

    describe('When target is Array', () => {
      let target;

      beforeEach(() => {
        target = [];
        ProxyCommands.createGETDescriptor(handler, target, isTemporary);
      });

      it('should add descriptor to Array', () => {
        expect(target).to.have.length(1);
        expect(target[0]).to.be.an.instanceof(Descriptor);
      });
    });

    describe('When target is Object', () => {
      let target;

      beforeEach(() => {
        target = {};
        ProxyCommands.createGETDescriptor(handler, target, isTemporary);
      });

      it('should add descriptor to Array', () => {
        expect(target[ProxyCommandFields.get]).to.be.an.instanceof(Descriptor);
      });
    });
  });

  describe('createSETDescriptor()', () => {
    let descriptor;
    let handler;
    let isTemporary;

    beforeEach(() => {
      handler = () => {
      };
      isTemporary = () => {
      };
      descriptor = ProxyCommands.createSETDescriptor(handler, null, isTemporary);
    });

    it('should contain Proxy SET property name', () => {
      expect(descriptor.name).to.be.equal(ProxyCommandFields.set);
    });

    it('should contain Proxy SET command type', () => {
      expect(descriptor.type).to.be.equal(ProxyCommandNames.SET);
    });

    it('should contain handler function', () => {
      expect(descriptor.handler).to.be.equal(handler);
    });

    it('should contain isTemporary function', () => {
      expect(descriptor.isTemporary).to.be.equal(isTemporary);
    });

    it('should not be virtual', () => {
      expect(descriptor.virtual).to.be.false;
    });
  });

  describe('createAPPLYDescriptor()', () => {
    let descriptor;
    let handler;
    let isTemporary;

    beforeEach(() => {
      handler = () => {
      };
      isTemporary = () => {
      };
      descriptor = ProxyCommands.createAPPLYDescriptor(handler, null, isTemporary);
    });
    it('should contain Proxy APPLY property name', () => {
      expect(descriptor.name).to.be.equal(ProxyCommandFields.apply);
    });
    it('should contain Proxy APPLY command type', () => {
      expect(descriptor.type).to.be.equal(ProxyCommandNames.APPLY);
    });
    it('should contain handler function', () => {
      expect(descriptor.handler).to.be.equal(handler);
    });
    it('should contain isTemporary function', () => {
      expect(descriptor.isTemporary).to.be.equal(isTemporary);
    });
    it('should not be virtual', () => {
      expect(descriptor.virtual).to.be.false;
    });
  });
});

describe('createDescriptors()', () => {
  let target;
  let getHandler;
  let setHandler;
  let applyHandler;
  let isTemporary;

  beforeEach(() => {
    getHandler = () => {
    };
    setHandler = () => {
    };
    applyHandler = () => {
    };
    isTemporary = () => {
    };
  });

  describe('When no target supplied', () => {
    let cacheable;

    beforeEach(() => {
      cacheable = true;
      target = createDescriptors({
        get: getHandler,
        set: setHandler,
        apply: applyHandler,
      }, undefined, isTemporary, cacheable);
    });

    it('should create target object', () => {
      expect(target).to.be.an('object');
    });

    it('should create properties for descriptors', () => {
      expect(target[ProxyCommandFields.get]).to.be.an.instanceof(Descriptor);
      expect(target[ProxyCommandFields.set]).to.be.an.instanceof(Descriptor);
      expect(target[ProxyCommandFields.apply]).to.be.an.instanceof(Descriptor);
    });

    it('should assign handlers', () => {
      expect(target[ProxyCommandFields.get].handler).to.be.equal(getHandler);
      expect(target[ProxyCommandFields.set].handler).to.be.equal(setHandler);
      expect(target[ProxyCommandFields.apply].handler).to.be.equal(applyHandler);
    });

    it('should assign isTemporary to all descriptors', () => {
      expect(target[ProxyCommandFields.get].isTemporary).to.be.equal(isTemporary);
      expect(target[ProxyCommandFields.set].isTemporary).to.be.equal(isTemporary);
      expect(target[ProxyCommandFields.apply].isTemporary).to.be.equal(isTemporary);
    });

    it('should pass cacheable argument', () => {
      expect(target[ProxyCommandFields.get].cacheable).to.be.equal(cacheable);
      expect(target[ProxyCommandFields.set].cacheable).to.be.equal(cacheable);
      expect(target[ProxyCommandFields.apply].cacheable).to.be.equal(cacheable);
    });
  });

  describe('When target is Array', () => {
    beforeEach(() => {
      target = [];
      createDescriptors({
        get: getHandler,
        deleteProperty: setHandler,
        set: applyHandler,
      }, target, isTemporary);
    });

    it('should have all descriptors added to target', () => {
      expect(target).to.have.length(3);
      expect(target[0]).to.be.an.instanceof(Descriptor);
    });
  });

  describe('When target is Object', () => {
    beforeEach(() => {
      target = {};
      createDescriptors({
        get: getHandler,
        set: setHandler,
        apply: applyHandler,
      }, target, isTemporary);
    });
    it('should have all descriptors added to target', () => {
      expect(target[ProxyCommandFields.get]).to.be.an.instanceof(Descriptor);
      expect(target[ProxyCommandFields.set]).to.be.an.instanceof(Descriptor);
      expect(target[ProxyCommandFields.apply]).to.be.an.instanceof(Descriptor);
    });
  });

  describe('When target is not what expected', () => {
    beforeEach(() => {
      target = createDescriptors({
        get: getHandler,
        set: setHandler,
        apply: applyHandler,
      }, null);
    });

    it('should not create target object', () => {
      expect(target).to.be.null;
    });
  });
});
