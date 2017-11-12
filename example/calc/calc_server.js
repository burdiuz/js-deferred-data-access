/**
 * Created by Oleg Galaburda on 11.04.16.
 */

/*
 1. Add Memory control
 2. Add C, CE buttons
 3. Server will send one resource for calculation and memory
 4. Client will send target Id and operation what should be done
 5. handlers for memory and calculation should be separated by closures,each closure will hold data
 */
var DataAccessInterface = require('../../dist/deferred-data-access');
var handlers = {};

(function(handlers) { // calculations
  var history = [];
  var commands = {
    '+': function() {

    },
    '-': function() {

    },
    '*': function() {

    },
    '/': function() {

    },
    '1/x': function() {

    },
    '%': function() {

    },
    '=': function() {

    }
  };

  function resetHandler(target, pack, deferred) {
    deferred.resolve();
  }

  function numberHandler(target, pack, deferred) {
    deferred.resolve();
  }

  function operationHandler(target, pack, deferred) {

    deferred.resolve();
  }

  handlers['number'] = numberHandler;
  handlers['operation'] = operationHandler;
  handlers['reset'] = resetHandler;
})(handlers);

(function(handlers) { // memory
  var value = '';

  function memoryStoreHandler() {

  }

  function memoryClearHandler() {

  }

  function memoryApplyHandler() {

  }

  function memoryAddHandler() {

  }

  function memoryTakeHandler() {

  }

  handlers['MC'] = memoryStoreHandler;
  handlers['MR'] = memoryClearHandler;
  handlers['MS'] = memoryApplyHandler;
  handlers['M+'] = memoryAddHandler;
  handlers['M-'] = memoryTakeHandler;
})(handlers);

var api = DataAccessInterface.create(handlers);
var resource = api.parse(DataAccessInterface.createForeignResource());

module.exports = function(app) {
  app.post('/calculate', function(req, res) {
    if (req.query.data) {
      var data = JSON.parse(req.query.data);
      resource[data.type](data.value).then(function(result) {
        res.json(result).end();
      });
    }
  });
};
