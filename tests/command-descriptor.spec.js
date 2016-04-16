describe.only('CommandDescriptor', function() {

  describe('When created', function() {

    describe('With all arguments', function() {
      var descriptor, handler;
      beforeEach(function() {
        handler = function() {
        };
        descriptor = new CommandDescriptor('command', handler, 'name');
      });

      it('should store arguments as fields', function() {
        expect(descriptor.name).to.be.equal('name');
        expect(descriptor.type).to.be.equal('command');
        expect(descriptor.handler).to.be.equal(handler);
        expect(descriptor.isTemporary).to.be.null;
        expect(descriptor.cacheable).to.be.false;
        expect(descriptor.virtual).to.be.false;
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
        delete item.handler;
      }).to.throw(Error);
    });
  });

});

describe('descriptorGeneratorFactory()', function() {
  var factory, item, handler, isTemporary;
  beforeEach(function() {
    handler = function() {
    };
    isTemporary = function() {
    };
    factory = descriptorGeneratorFactory('command', 'name');
    item = factory(handler, null, isTemporary);
  });
  it('should create new instance of CommandDescriptor', function() {
    expect(item).to.be.an.instanceof(CommandDescriptor);
    expect(item).to.not.be.equal(factory(function() {
    }));
  });
  it('created descriptor should have all properties set', function() {
    expect(item.name).to.be.equal('name');
    expect(item.type).to.be.equal('command');
    expect(item.handler).to.be.equal(handler);
    expect(item.isTemporary).to.be.equal(isTemporary);
  });
});

describe('RequestTargetCommands', function() {
  describe('createDESTROYDescriptor()', function() {
    var handler, descriptor;
    beforeEach(function() {
      handler = function() {
      };
      descriptor = RequestTargetCommands.createDESTROYDescriptor(handler);
    });
    it('should has DESTROY name/type', function(){
      expect(descriptor.name).to.be.equal(RequestTargetCommands.fields.DESTROY);
      expect(descriptor.type).to.be.equal(RequestTargetCommands.DESTROY);
    });
    it('should store handler function ', function(){
      expect(descriptor.handler).to.be.equal(handler);
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
    var descriptor, handler, isTemporary;
    beforeEach(function() {
      handler = function() {
      };
      isTemporary = function() {
      };
      descriptor = ProxyCommands.createGETDescriptor(handler, null, isTemporary);
    });
    it('should contain Proxy GET property name', function() {
      expect(descriptor.name).to.be.equal(ProxyCommands.fields.get);
    });
    it('should contain Proxy GET commant type', function() {
      expect(descriptor.type).to.be.equal(ProxyCommands.GET);
    });
    it('should contain handler function', function() {
      expect(descriptor.handler).to.be.equal(handler);
    });
    it('should not be virtual', function() {
      expect(descriptor.virtual).to.be.false;
    });
    it('should contain isTemporary function', function() {
      expect(descriptor.isTemporary).to.be.null;
    });
    it('should be cacheable', function() {
      expect(descriptor.cacheable).to.be.true;
    });

    describe('When target is Array', function() {
      var target;
      beforeEach(function() {
        target = [];
        ProxyCommands.createGETDescriptor(handler, target, isTemporary);
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
        ProxyCommands.createGETDescriptor(handler, target, isTemporary);
      });
      it('should add descriptor to Array', function() {
        expect(target[ProxyCommands.fields.get]).to.be.an.instanceof(CommandDescriptor);
      });
    });

  });

  describe('createSETDescriptor()', function() {
    var descriptor, handler, isTemporary;
    beforeEach(function() {
      handler = function() {
      };
      isTemporary = function() {
      };
      descriptor = ProxyCommands.createGETDescriptor(handler, null, isTemporary);
    });
    it('should contain Proxy SET property name', function() {
      expect(descriptor.name).to.be.equal(ProxyCommands.fields.get);
    });
    it('should contain Proxy SET command type', function() {
      expect(descriptor.type).to.be.equal(ProxyCommands.GET);
    });
    it('should contain handler function', function() {
      expect(descriptor.handler).to.be.equal(handler);
    });
    it('should contain isTemporary function', function() {
      expect(descriptor.isTemporary).to.be.null;
    });
    it('should not be virtual', function() {
      expect(descriptor.virtual).to.be.false;
    });
  });

  describe('createAPPLYDescriptor()', function() {
    var descriptor, handler, isTemporary;
    beforeEach(function() {
      handler = function() {
      };
      isTemporary = function() {
      };
      descriptor = ProxyCommands.createGETDescriptor(handler, isTemporary);
    });
    it('should contain Proxy APPLY property name', function() {
      expect(descriptor.name).to.be.equal(ProxyCommands.fields.get);
    });
    it('should contain Proxy APPLY command type', function() {
      expect(descriptor.type).to.be.equal(ProxyCommands.GET);
    });
    it('should contain handler function', function() {
      expect(descriptor.handler).to.be.equal(handler);
    });
    it('should contain isTemporary function', function() {
      expect(descriptor.isTemporary).to.be.equal(isTemporary);
    });
    it('should not be virtual', function() {
      expect(descriptor.virtual).to.be.false;
    });
  });

  describe('createDescriptors()', function() {
    var target, getHandler, setHandler, applyHandler, isTemporary;
    beforeEach(function() {
      getHandler = function() {
      };
      setHandler = function() {
      };
      applyHandler = function() {
      };
      isTemporary = function() {
      };
    });

    describe('When no target supplied', function() {
      var cacheable;
      beforeEach(function() {
        cacheable = true;
        target = ProxyCommands.createDescriptors({
          get: getHandler,
          set: setHandler,
          apply: applyHandler
        }, null, isTemporary, cacheable);
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
        expect(target[ProxyCommands.fields.get].handle).to.be.equal(getHandler);
        expect(target[ProxyCommands.fields.set].handle).to.be.equal(setHandler);
        expect(target[ProxyCommands.fields.apply].handle).to.be.equal(applyHandler);
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
          get: getHandler,
          deleteProperty: setHandler,
          set: applyHandler
        }, target, isTemporary);
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
          get: getHandler,
          set: setHandler,
          apply: applyHandler
        }, target, isTemporary);
      });
      it('should have all descriptors added to target', function() {
        expect(target[ProxyCommands.fields.get]).to.be.an.instanceof(CommandDescriptor);
        expect(target[ProxyCommands.fields.set]).to.be.an.instanceof(CommandDescriptor);
        expect(target[ProxyCommands.fields.apply]).to.be.an.instanceof(CommandDescriptor);
      });
    });
  });
});
