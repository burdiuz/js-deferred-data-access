// Uses Node, AMD or browser globals to create a module.
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.DataAccessInterface = factory();
  }
}(this, function() {
  var EventDispatcher = (function() {
    //=include ../node_modules/event-dispatcher/source/event-dispatcher.js
    return EventDispatcher;
  })();
  // here should be injected deferred-data-access.js content
  //=include core.js
  //=include target-resource.js
  //=include target-pool.js
  //=include target-pool-registry.js
  //=include resource-converter.js
  //=include request-target-internals.js
  //=include request-target.js
  //=include data-access-interface.js
  return DataAccessInterface;
}));
