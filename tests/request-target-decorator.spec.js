describe('RequestTargetDecorator', function() {
  var decorator, resource, factory, handlers;
  var requestData, resolveRequest;
  var sandbox, _CommandHandlerFactory, commandHFInstance, commandHandlerResult;

  before(function() {
    _CommandHandlerFactory = CommandHandlerFactory;
    sandbox = sinon.sandbox.create();
    commandHandlerResult = function() {
    };
    CommandHandlerFactory = sandbox.spy(function() {
      commandHFInstance = this;
      this.get = sandbox.spy(function() {
        return commandHandlerResult;
      });
      this.setFactory = sandbox.spy();
    });
  });

  after(function() {
    CommandHandlerFactory = _CommandHandlerFactory;
    sandbox.restore();
  });

  beforeEach(function() {
    factory = {};
    handlers = RequestHandlers.create();
    handlers.setHandlers({
      action: sandbox.spy(),
      type: sandbox.spy(),
      property: CommandDescriptor.create('command', function(){}, 'property', null, false, true)
    });

    resolveRequest = true;

    resource = {};
    CommandHandlerFactory.reset();
    decorator = RequestTargetDecorator.create(factory, handlers);
  });

  describe('When created', function() {
    it('should instantiate CommandHandlerFactory', function() {
      assert(CommandHandlerFactory.calledWithNew(), 'create factory');
    });
    it('should pass factory to CommandHandlerFactory', function() {
      expect(commandHFInstance.setFactory).to.be.calledOnce;
      expect(commandHFInstance.setFactory).to.be.calledWith(factory);
    });
  });
  describe('When factory changed', function() {
    var newFactory;
    beforeEach(function() {
      newFactory = {};
      commandHFInstance.setFactory.reset();
      decorator.setFactory(newFactory);
    });
    it('should update factory for command handlers', function() {
      expect(commandHFInstance.setFactory).to.be.calledOnce;
      expect(commandHFInstance.setFactory).to.be.calledWith(newFactory);
    });
    it('should not pass NULL factory', function() {
      decorator.setFactory(null);
      expect(commandHFInstance.setFactory).to.be.calledOnce;
    });
  });

  describe('When handlers are not available', function() {
    beforeEach(function() {
      handlers.setHandlers({});
    });
    it('should work as expected', function() {
      expect(function() {
        decorator.apply(resource);
      }).to.not.throw(Error);
    });
  });

  describe('When decorating request', function() {
    beforeEach(function() {
      decorator.apply(resource);
    });

    it('should add type members to target', function() {
      expect(resource.action).to.be.equal(commandHandlerResult);
      expect(resource.type).to.be.equal(commandHandlerResult);
    });

    it('should skip virtual descriptors', function() {
      expect(resource).to.not.have.property('property');
    });

    it('should request members from CommandHandlerFactory', function() {
      expect(commandHFInstance.get).to.be.calledTwice;
      expect(commandHFInstance.get.getCall(0).args[0]).to.be.an.instanceof(CommandDescriptor);
    });

    describe('When decorating other request', function() {
      var newRequest;
      beforeEach(function() {
        newRequest = {};
        decorator.apply(newRequest);
      });
      it('members should be same handlers', function() {
        expect(newRequest.action).to.be.equal(resource.action);
        expect(newRequest.type).to.be.equal(resource.type);
      });
    })

    describe('When handlers changed', function() {
      beforeEach(function() {
        handlers.setHandlers({
          updated: sandbox.spy()
        });

        resource = {};
        decorator.apply(resource);
      });
      it('members should be latest handlers', function() {
        expect(resource.updated).to.be.an('function');
        expect(resource.type).to.be.undefined;
      });
    });

  });

});
