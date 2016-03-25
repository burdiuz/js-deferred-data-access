describe('RequestHandlers', function() {
  var handlers, sandbox;

  function __createProxyCommandHandlers(data, sandbox) {
    data = data || {};
    sandbox = sandbox || sinon;
    ProxyCommands.createDescriptors({
      get: sandbox.spy(),
      set: sandbox.spy(),
      apply: sandbox.spy()
    }, sandbox.spy(), data);
    return data;
  }

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  beforeEach(function() {
    handlers = RequestHandlers.create();
  });

  describe('When created', function() {
    beforeEach(function() {
      sandbox.spy(RequestHandlers, 'areProxyHandlersAvailable');
    });
    it('should set proxyEnabled to false', function() {
      expect(handlers.proxyEnabled).to.be.false;
    });
    it('should be unavailable', function() {
      expect(handlers.available).to.be.false;
    });

    describe('setHandlers()', function() {
      var hndlr, hndlrII;
      beforeEach(function() {
        hndlr = function() {
        };
        hndlrII = function() {
        };
        handlers.setHandlers({
          hndlr: hndlr,
          hndlrII: hndlrII,
          fakeHandler: 'anything',
          fakeHandlerII: {}
        });
      });
      it('should throw an Error for handler of type named with reserved word', function() {
        expect(function() {
          handlers.setHandlers({
            then: function() {
            }
          });
        }).to.throw(Error);
        expect(function() {
          handlers.setHandlers({
            catch: 'not - a - type'
          });
        }).to.not.throw(Error);
      });
      it('should become available', function() {
        expect(handlers.available).to.be.true;
      });
      it('should not check handlers for compatibility with proxies', function() {
        expect(RequestHandlers.areProxyHandlersAvailable).to.not.be.called;
      });
      it('should accept passed handlers', function() {
        expect(handlers.hasHandler('hndlr')).to.be.true;
      });
      it('should return false for non-existent handlers', function() {
        expect(handlers.hasHandler('abcdEFG')).to.be.false;
      });
      it('should return null when accessing non-existent handlers', function() {
        expect(handlers.getHandler('hijKLNM')).to.be.null;
      });
      it('handlers should be available', function() {
        expect(handlers.getHandler('hndlr')).to.be.an.instanceof(CommandDescriptor);
        var allHandlers = handlers.getHandlers();
        expect(allHandlers.hndlr).to.be.an.instanceof(CommandDescriptor);
        expect(allHandlers.hndlrII).to.be.an.instanceof(CommandDescriptor);
      });
      it('handlers names should be listed', function() {
        expect(handlers.getHandlerNames()).to.contain('hndlr');
        expect(handlers.getHandlerNames()).to.contain('hndlrII');
      });
      it('should filter functions only', function() {
        expect(handlers.hasHandler('fakeHandler')).to.be.false;
        expect(handlers.hasHandler('fakeHandlerII')).to.be.false;
      });
    });
  });

  describe('Iterator', function() {
    'use strict';
    var handlers;
    beforeEach(function() {
      handlers = RequestHandlers.create();
      handlers.setHandlers({
        hndl1: function() {
        },
        hndl2: function() {
        }
      });
    });
    it('should be able to generate Iterators', function() {
      var iterator = handlers[Symbol.iterator]();
      expect(iterator).to.be.an('object');
      expect(iterator.next).to.be.a('function');
    });
    it('Iterator should go through all handlers', function() {
      var iterator = handlers[Symbol.iterator]();
      var item = iterator.next();
      expect(item.value).to.be.an.instanceof(CommandDescriptor);
      expect(item.done).to.be.false;
      var item = iterator.next();
      expect(item.value).to.be.an.instanceof(CommandDescriptor);
      expect(item.done).to.be.false;
      var item = iterator.next();
      expect(item.done).to.be.true;
    });
    it('should be iterator for itself', function() {
      var iterator = handlers[Symbol.iterator]();
      expect(iterator[Symbol.iterator]()).to.be.equal(iterator);
    });
  });

  describe('When created with Proxies enabled', function() {
    beforeEach(function() {
      handlers = RequestHandlers.create(true);
    });

    describe('setHandlers()', function() {
      it('should throw for incompatible handlers', function() {
        expect(function() {
          handlers.setHandlers({
            hndlr: function() {
            }
          });
        }).to.throw(Error);
      });

      it('should accept compatible handlers', function() {
        expect(function() {
          handlers.setHandlers(__createProxyCommandHandlers());
        }).to.not.throw(Error);
      });

    });
  });

  describe('handle()', function() {
    var commandHandler, resource, pack, deferred;
    beforeEach(function() {
      commandHandler = sandbox.spy(function() {
        deferred.resolve('something!');
      });
      resource = {};
      pack = {
        type: 'type'
      };
      deferred = createDeferred();
      handlers.setHandlers({
        type: commandHandler
      });
    });

    it('should throw Error non-existent handler', function() {
      expect(function() {
        handlers.handle(resource, 'no-type', pack, deferred);
      }).to.throw(Error);
    });

    describe('When called', function() {
      beforeEach(function() {
        handlers.handle(resource, 'type', pack, deferred);
      });

      it('should call type handler', function() {
        expect(commandHandler).to.be.calledOnce;
      });

      it('should pass type parameters into handler', function() {
        var args = commandHandler.getCall(0).args;
        expect(args).to.be.eql([resource, pack, deferred]);
      });
    });

    describe('When converter was specified', function() {
      var converter;
      beforeEach(function() {
        converter = {};
        handlers.setConverter(converter);
      });

      describe('When has pending promises', function() {
        var pending;
        beforeEach(function() {
          pending = createDeferred();
          converter.lookupForPending = sandbox.spy(function() {
            return [pending.promise];
          });
          handlers.handle(resource, 'type', pack, deferred);
        });

        it('should not call handler immediately', function() {
          expect(commandHandler).to.not.be.called;
        });

        it('should check for pending', function() {
          expect(converter.lookupForPending).to.be.calledOnce;
        });

        it('should wait for pending promise', function(done) {
          deferred.promise.then(function() {
            expect(commandHandler).to.be.calledOnce;
            done();
          });
          pending.resolve('pending resolved');
        });


      });

      describe('When no pending promises found', function() {
        beforeEach(function() {
          converter.lookupForPending = sandbox.spy(function() {
            return [];
          });

          handlers.handle(resource, 'type', pack, deferred);
        });

        it('should check for pending', function() {
          expect(converter.lookupForPending).to.be.calledOnce;
        });

        it('should call handler immediately', function() {
          expect(commandHandler).to.be.calledOnce;
        });
      });

    });

  });

  describe('create()', function() {
    it('should create new instance of RequestHandlers', function() {
      var result = RequestHandlers.create();
      expect(result).to.be.an.instanceof(RequestHandlers);
      expect(result).to.not.be.equal(handlers);
    });
  });

});
