describe('CommandDescriptor', function() {

  describe('When created', function() {

    describe('With all arguments', function() {
      var descriptor, isTemporary, handle;
      beforeEach(function() {
        handle = function() {
        };
        isTemporary = function() {
        };
        descriptor = new CommandDescriptor('name', handle, 'command', isTemporary);
      });

      it('should store arguments as fields', function() {
        expect(descriptor.name).to.be.equal('name');
        expect(descriptor.type).to.be.equal('command');
        expect(descriptor.isTemporary).to.be.equal(isTemporary);
        expect(descriptor.handle).to.be.equal(handle);
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
        descriptor = new CommandDescriptor('name', function() {
        });
      });
      it('should use "name" as command value', function() {
        expect(descriptor.name).to.be.equal(descriptor.type);
      });
    });

  });

  describe('create()', function() {
    'use strict';
    var item;
    beforeEach(function() {
      item = CommandDescriptor.create('name', function() {
      }, 'command');
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
    factory = descriptorGeneratorFactory('name', 'command');
    item = factory(handle, isTemporary);
  });
  it('should create new instance of CommandDescriptor', function() {
    expect(item).to.be.an.instanceof(CommandDescriptor);
    expect(item).to.not.be.equal(factory(function() {
    }));
  });
  it('should apply handle function', function() {
    expect(item.handle).to.be.equal(handle);
  });
  it('should apply isTemporary function', function() {
    expect(item.isTemporary).to.be.equal(isTemporary);
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
    it('should contain isTemporary function', function() {
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
      beforeEach(function() {
        target = ProxyCommands.createDescriptors(getHandle, setHandle, applyHandle, isTemporary);
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
    });

    describe('When target isArray', function() {
      beforeEach(function() {
        target = [];
        ProxyCommands.createDescriptors(getHandle, setHandle, applyHandle, isTemporary, target);
      });
      it('should have all descriptors added to target', function() {
        expect(target).to.have.length(3);
        expect(target[0]).to.be.an.instanceof(CommandDescriptor);
      });
    });

    describe('When target is Object', function() {
      beforeEach(function() {
        target = {};
        ProxyCommands.createDescriptors(getHandle, setHandle, applyHandle, isTemporary, target);
      });
      it('should have all descriptors added to target', function() {
        expect(target[ProxyCommands.fields.get]).to.be.an.instanceof(CommandDescriptor);
        expect(target[ProxyCommands.fields.set]).to.be.an.instanceof(CommandDescriptor);
        expect(target[ProxyCommands.fields.apply]).to.be.an.instanceof(CommandDescriptor);
      });
    });
  });
});
