describe('CommandDescriptor', function() {

  describe('When created', function() {

    describe('With all arguments', function() {
      var descriptor, isTemporary, handle, cacheable, virtual;
      beforeEach(function() {
        cacheable = 1;
        virtual = 1;
        handle = function() {
        };
        isTemporary = function() {
        };
        descriptor = new CommandDescriptor('command', handle, 'name', isTemporary, cacheable, virtual);
      });

      it('should store arguments as fields', function() {
        expect(descriptor.name).to.be.equal('name');
        expect(descriptor.type).to.be.equal('command');
        expect(descriptor.isTemporary).to.be.equal(isTemporary);
        expect(descriptor.handle).to.be.equal(handle);
        expect(descriptor.cacheable).to.be.equal(Boolean(cacheable));
        expect(descriptor.virtual).to.be.equal(Boolean(virtual));
      });
    });

    describe('Without isTemplate', function() {
      var descriptor;
      beforeEach(function() {
        descriptor = new CommandDescriptor('name', function() {
        }, 'command');
      });
      it('should contain default isTemporary', function() {
        expect(descriptor.isTemporary).to.be.a('function');
      });
      it('isTemporary should return false by default', function() {
        expect(descriptor.isTemporary(__createRequestTarget())).to.be.false;
        expect(descriptor.isTemporary({})).to.be.false;
        expect(descriptor.isTemporary()).to.be.false;
      });
    });

    describe('Without command', function() {
      var descriptor;
      beforeEach(function() {
        descriptor = new CommandDescriptor('command', function() {
        });
      });
      it('should use type as "name" value', function() {
        expect(descriptor.name).to.be.equal(descriptor.type);
      });
    });

  });

  describe('create()', function() {
    'use strict';
    var item;
    beforeEach(function() {
      item = CommandDescriptor.create('command', function() {
      }, 'name');
    });
    it('should create new instance of CommandDescriptor', function() {
      expect(item).to.be.an.instanceof(CommandDescriptor);
    });
    it('should freeze results', function() {
      expect(function() {
        item.name = null;
      }).to.throw(Error);
      expect(function() {
        item.type = null;
      }).to.throw(Error);
      expect(function() {
        delete item.handle;
      }).to.throw(Error);
    });
  });

});

describe('descriptorGeneratorFactory()', function() {
  var factory, item, handle, isTemporary;
  beforeEach(function() {
    handle = function() {
    };
    isTemporary = function() {
    };
    factory = descriptorGeneratorFactory('command', 'name');
    item = factory(handle, isTemporary);
  });
  it('should create new instance of CommandDescriptor', function() {
    expect(item).to.be.an.instanceof(CommandDescriptor);
    expect(item).to.not.be.equal(factory(function() {
    }));
  });
  it('created descriptor should have all properties set', function() {
    expect(item.name).to.be.equal('name');
    expect(item.type).to.be.equal('command');
    expect(item.handle).to.be.equal(handle);
    expect(item.isTemporary).to.be.equal(isTemporary);
  });
});

describe('RequestTargetCommands', function() {
  describe('createDESTROYDescriptor()', function() {
    var handle, descriptor;
    beforeEach(function() {
      handle = function() {
      };
      descriptor = RequestTargetCommands.createDESTROYDescriptor(handle);
    });
    it('should has DESTROY name/type', function(){
      expect(descriptor.name).to.be.equal(RequestTargetCommands.fields.DESTROY);
      expect(descriptor.type).to.be.equal(RequestTargetCommands.DESTROY);
    });
    it('should store handler function ', function(){
      expect(descriptor.handle).to.be.equal(handle);
    });
    it('should create not cacheable descriptor', function(){
      expect(descriptor.cacheable).to.be.false;
    });
    it('should create virtual descriptor', function(){
      expect(descriptor.virtual).to.be.true;
    });
  });
});

describe('ProxyCommands', function() {

  describe('list', function() {
    it('should contain all Proxy commands', function() {
      var list = ProxyCommands.list;
      for (var name in ProxyCommands) {
        var command = ProxyCommands[name];
        if (typeof(command) === 'string') {
          expect(list).to.contain(command);
        }
      }
    });
    it('should be read-only', function() {
      var length = ProxyCommands.list.length;
      ProxyCommands.list.shift();
      expect(length).to.be.equal(ProxyCommands.list.length);
    });
  });

  describe('createGETDescriptor()', function() {
    var descriptor, handle, isTemporary;
    beforeEach(function() {
      handle = function() {
      };
      isTemporary = function() {
      };
      descriptor = ProxyCommands.createGETDescriptor(handle, isTemporary);
    });
    it('should contain Proxy GET property name', function() {
      expect(descriptor.name).to.be.equal(ProxyCommands.fields.get);
    });
    it('should contain Proxy GET commant type', function() {
      expect(descriptor.type).to.be.equal(ProxyCommands.GET);
    });
    it('should contain handler function', function() {
      expect(descriptor.handle).to.be.equal(handle);
    });
    it('should not be virtual', function() {
      expect(descriptor.virtual).to.be.false;
    });
    it('should contain isTemporary function', function() {
      expect(descriptor.isTemporary).to.be.equal(isTemporary);
    });
    it('should be cacheable', function() {
      expect(descriptor.isTemporary).to.be.equal(isTemporary);
    });

    describe('When target is Array', function() {
      var target;
      beforeEach(function() {
        target = [];
        ProxyCommands.createGETDescriptor(handle, isTemporary, target);
      });
      it('should add descriptor to Array', function() {
        expect(target).to.have.length(1);
        expect(target[0]).to.be.an.instanceof(CommandDescriptor);
      });
    });

    describe('When target is Object', function() {
      var target;
      beforeEach(function() {
        target = {};
        ProxyCommands.createGETDescriptor(handle, isTemporary, target);
      });
      it('should add descriptor to Array', function() {
        expect(target[ProxyCommands.fields.get]).to.be.an.instanceof(CommandDescriptor);
      });
    });

  });

  describe('createSETDescriptor()', function() {
    var descriptor, handle, isTemporary;
    beforeEach(function() {
      handle = function() {
      };
      isTemporary = function() {
      };
      descriptor = ProxyCommands.createGETDescriptor(handle, isTemporary);
    });
    it('should contain Proxy SET property name', function() {
      expect(descriptor.name).to.be.equal(ProxyCommands.fields.get);
    });
    it('should contain Proxy SET command type', function() {
      expect(descriptor.type).to.be.equal(ProxyCommands.GET);
    });
    it('should contain handler function', function() {
      expect(descriptor.handle).to.be.equal(handle);
    });
    it('should contain isTemporary function', function() {
      expect(descriptor.isTemporary).to.be.equal(isTemporary);
    });
    it('should not be virtual', function() {
      expect(descriptor.virtual).to.be.false;
    });
  });

  describe('createAPPLYDescriptor()', function() {
    var descriptor, handle, isTemporary;
    beforeEach(function() {
      handle = function() {
      };
      isTemporary = function() {
      };
      descriptor = ProxyCommands.createGETDescriptor(handle, isTemporary);
    });
    it('should contain Proxy APPLY property name', function() {
      expect(descriptor.name).to.be.equal(ProxyCommands.fields.get);
    });
    it('should contain Proxy APPLY command type', function() {
      expect(descriptor.type).to.be.equal(ProxyCommands.GET);
    });
    it('should contain handler function', function() {
      expect(descriptor.handle).to.be.equal(handle);
    });
    it('should contain isTemporary function', function() {
      expect(descriptor.isTemporary).to.be.equal(isTemporary);
    });
    it('should not be virtual', function() {
      expect(descriptor.virtual).to.be.false;
    });
  });

  describe('createDescriptors()', function() {
    var target, getHandle, setHandle, applyHandle, isTemporary;
    beforeEach(function() {
      getHandle = function() {
      };
      setHandle = function() {
      };
      applyHandle = function() {
      };
      isTemporary = function() {
      };
    });

    describe('When no target supplied', function() {
      var cacheable;
      beforeEach(function() {
        cacheable = true;
        target = ProxyCommands.createDescriptors({
          get: getHandle,
          set: setHandle,
          apply: applyHandle
        }, isTemporary, null, cacheable);
      });
      it('should create target object', function() {
        expect(target).to.be.an('object');
      });
      it('should create properties for descriptors', function() {
        expect(target[ProxyCommands.fields.get]).to.be.an.instanceof(CommandDescriptor);
        expect(target[ProxyCommands.fields.set]).to.be.an.instanceof(CommandDescriptor);
        expect(target[ProxyCommands.fields.apply]).to.be.an.instanceof(CommandDescriptor);
      });
      it('should assign handlers', function() {
        expect(target[ProxyCommands.fields.get].handle).to.be.equal(getHandle);
        expect(target[ProxyCommands.fields.set].handle).to.be.equal(setHandle);
        expect(target[ProxyCommands.fields.apply].handle).to.be.equal(applyHandle);
      });
      it('should assign isTemporary to all descriptors', function() {
        expect(target[ProxyCommands.fields.get].isTemporary).to.be.equal(isTemporary);
        expect(target[ProxyCommands.fields.set].isTemporary).to.be.equal(isTemporary);
        expect(target[ProxyCommands.fields.apply].isTemporary).to.be.equal(isTemporary);
      });
      it('should pass cacheable argument', function() {
        expect(target[ProxyCommands.fields.get].cacheable).to.be.equal(cacheable);
        expect(target[ProxyCommands.fields.set].cacheable).to.be.equal(cacheable);
        expect(target[ProxyCommands.fields.apply].cacheable).to.be.equal(cacheable);
      });
    });

    describe('When target is Array', function() {
      beforeEach(function() {
        target = [];
        ProxyCommands.createDescriptors({
          get: getHandle,
          deleteProperty: setHandle,
          set: applyHandle
        }, isTemporary, target);
      });
      it('should have all descriptors added to target', function() {
        expect(target).to.have.length(3);
        expect(target[0]).to.be.an.instanceof(CommandDescriptor);
      });
    });

    describe('When target is Object', function() {
      beforeEach(function() {
        target = {};
        ProxyCommands.createDescriptors({
          get: getHandle,
          set: setHandle,
          apply: applyHandle
        }, isTemporary, target);
      });
      it('should have all descriptors added to target', function() {
        expect(target[ProxyCommands.fields.get]).to.be.an.instanceof(CommandDescriptor);
        expect(target[ProxyCommands.fields.set]).to.be.an.instanceof(CommandDescriptor);
        expect(target[ProxyCommands.fields.apply]).to.be.an.instanceof(CommandDescriptor);
      });
    });
  });
});
