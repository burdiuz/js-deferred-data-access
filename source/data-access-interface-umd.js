// Uses Node, AMD or browser globals to create a module.
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['EventDispatcher'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('EventDispatcher'));
  } else {
    // Browser globals (root is window)
    root.DataAccessInterface = factory(root.EventDispatcher);
  }
}(this, function(EventDispatcher) {
  // here should be injected deferred-data-access.js content
  //=include core.js
  //=include command-descriptor.js
  //=include target-resource.js
  //=include resource-pool.js
  //=include resource-pool-registry.js
  //=include resource-converter.js
  //=include request-handlers.js
  //=include request-target-decorator.js
  //=include request-factory.js
  //=include request-proxy-factory.js
  //=include request-target-internals.js
  //=include request-target.js
  //=include data-access-interface.js
  return DataAccessInterface;
}));
