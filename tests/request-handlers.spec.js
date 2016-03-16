/**
 * Created by Oleg Galaburda on 16.03.16.
 */

describe('RequestHandlers', function() {
  var handlers, sandbox;

  function __createProxyCommandHandlers(data, sandbox) {
    data = data || {};
    sandbox = sandbox || sinon;
    for (var name in ProxyCommands) {
      data[ProxyCommands[name]] = sandbox.spy();
    }
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
      it('should throw an Error for handler of command named with reserved word', function() {
        expect(function() {
          handlers.setHandlers({
            then: function() {
            }
          });
        }).to.throw(Error);
        expect(function() {
          handlers.setHandlers({
            catch: 'not - a - command'
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
        expect(handlers.getHandler('hndlr')).to.be.a('function');
        expect(handlers.getHandlers()).to.be.eql({
          hndlr: hndlr,
          hndlrII: hndlrII
        });
      });
      it('should filter functions only', function() {
        expect(handlers.hasHandler('fakeHandler')).to.be.false;
        expect(handlers.hasHandler('fakeHandlerII')).to.be.false;
      });
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
        type: 'command'
      };
      deferred = createDeferred();
      handlers.setHandlers({
        command: commandHandler
      });
    });

    describe('When called', function() {
      beforeEach(function() {
        handlers.handle(resource, pack, deferred);
      });

      it('should call command handler', function() {
        expect(commandHandler).to.be.calledOnce;
      });

      it('should pass command parameters into handler', function() {
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
          handlers.handle(resource, pack, deferred);
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

          handlers.handle(resource, pack, deferred);
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

  describe('isTemporary', function() {
    it('should return false by default', function() {
      expect(handlers.isTemporary(__createRequestTarget())).to.be.false;
      expect(handlers.isTemporary({})).to.be.false;
      expect(handlers.isTemporary()).to.be.false;
    });
    it('should be writable', function() {
      var func = function() {

      };
      handlers.isTemporary = func;
      expect(handlers.isTemporary).to.be.equal(func);
    });
    it('should be function after nullified', function() {
      handlers.isTemporary = null;
      expect(handlers.isTemporary).to.be.a('function');
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
