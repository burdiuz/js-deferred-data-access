describe('ResourceConverter', function() {
  var converter, factory, pool, handlers, sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    factory = {
      create: sandbox.spy()
    };
    pool = {
      set: sandbox.spy(function() {
        return {
          toJSON: sandbox.spy()
        };
      })
    };
    handlers = {
      setConverter: sandbox.spy()
    };
    converter = ResourceConverter.create(factory, pool, handlers);
  });
  afterEach(function() {
    sandbox.restore();
  });


  describe('toJSON()', function() {

  });

  describe('parse()', function() {

  });

  describe('lookupArray()', function() {

  });

  describe('lookupObject()', function() {

  });

  describe('lookupForPending()', function() {

  });

  describe('resourceToObject()', function() {

  });

  describe('objectToResource()', function() {

  });

});
