(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["DataAccessInterface"] = factory();
	else
		root["DataAccessInterface"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:8081/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 20);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TargetStatus = exports.TargetStatus = Object.freeze({
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DESTROYED: 'destroyed'
});

/**
 * @type {Symbol}
 * @private
 */
var TARGET_INTERNALS = exports.TARGET_INTERNALS = Symbol('request.target:internals');
/**
 *
 * @type {string}
 * @private
 */
var TARGET_DATA = exports.TARGET_DATA = 'resource::data';

/**
 * @private
 */
var getId = exports.getId = function () {
  var base = 'DA/' + Date.now() + '/';
  var index = 0;
  return function () {
    return '' + base + ++index + '/' + Date.now();
  };
}();

/**
 * @constructor
 * @alias DataAccessInterface.Deferred
 */

var Deferred = exports.Deferred = function Deferred() {
  var _this = this;

  _classCallCheck(this, Deferred);

  this.promise = new Promise(function (resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
  });
};

/**
 * @returns {Deferred}
 * @private
 */


var createDeferred = exports.createDeferred = function createDeferred() {
  return new Deferred();
};

/**
 * @returns {boolean}
 * @private
 */
var areProxiesAvailable = exports.areProxiesAvailable = function areProxiesAvailable() {
  return typeof Proxy === 'function';
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getResourcePoolId = exports.getResourceId = exports.getResourceData = exports.getRawResource = exports.createForeignResource = exports.areSameResource = exports.isResource = exports.getResourceType = exports.isResourceConvertible = exports.IConvertible = exports.defaultResourcePool = undefined;

var _defaultResourcePool = __webpack_require__(13);

var _defaultResourcePool2 = _interopRequireDefault(_defaultResourcePool);

var _IConvertible = __webpack_require__(14);

var _IConvertible2 = _interopRequireDefault(_IConvertible);

var _resourceUtils = __webpack_require__(15);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.defaultResourcePool = _defaultResourcePool2.default;
exports.IConvertible = _IConvertible2.default;
exports.isResourceConvertible = _IConvertible.isResourceConvertible;
exports.getResourceType = _resourceUtils.getResourceType;
exports.isResource = _resourceUtils.isResource;
exports.areSameResource = _resourceUtils.areSameResource;
exports.createForeignResource = _resourceUtils.createForeignResource;
exports.getRawResource = _resourceUtils.getRawResource;
exports.getResourceData = _resourceUtils.getResourceData;
exports.getResourceId = _resourceUtils.getResourceId;
exports.getResourcePoolId = _resourceUtils.getResourcePoolId;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequestTarget = exports.sendRequest = exports.getChildrenCount = exports.getLastChild = exports.getChildren = exports.getRawPromise = exports.hadChildPromises = exports.getQueueCommands = exports.getQueueLength = exports.isPending = exports.getStatus = exports.setTemporary = exports.isTemporary = exports.toJSON = exports.destroy = exports.canBeDestroyed = exports.isActive = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(0);

var _resource = __webpack_require__(4);

var _RequestTargetInternals = __webpack_require__(16);

var _RequestTargetInternals2 = _interopRequireDefault(_RequestTargetInternals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PROMISE_FIELD = Symbol('request.target::promise');

var getRequestPromise = function getRequestPromise(request) {
  return request[_utils.TARGET_INTERNALS] || request[PROMISE_FIELD];
};

/**
 * The object that will be available on other side
 * @class DataAccessInterface.RequestTarget
 * @param _promise {Promise}
 * @param _requestHandlers {RequestHandlers}
 */

var RequestTarget = function () {
  function RequestTarget(promise, requestHandlers) {
    var _this = this;

    _classCallCheck(this, RequestTarget);

    this[_utils.TARGET_INTERNALS] = new _RequestTargetInternals2.default(this, promise, requestHandlers);

    var handlePromise = function handlePromise(data) {
      if (!(0, _resource.isResource)(data)) {
        _this[PROMISE_FIELD] = promise;
        delete _this[_utils.TARGET_INTERNALS];
      }
    };

    promise.then(handlePromise, handlePromise);
  }

  _createClass(RequestTarget, [{
    key: 'then',
    value: function then() {
      var target = getRequestPromise(this);
      return target.then.apply(target, arguments);
    }
  }, {
    key: 'catch',
    value: function _catch() {
      var target = getRequestPromise(this);
      return target.catch.apply(target, arguments);
    }
  }]);

  return RequestTarget;
}();

var isActive = exports.isActive = function isActive(target) {
  return target && target[_utils.TARGET_INTERNALS] ? target[_utils.TARGET_INTERNALS].isActive() : false;
};

var canBeDestroyed = exports.canBeDestroyed = function canBeDestroyed(target) {
  return target && target[_utils.TARGET_INTERNALS] ? target[_utils.TARGET_INTERNALS].canBeDestroyed() : false;
};

var destroy = exports.destroy = function destroy(target) {
  return target && target[_utils.TARGET_INTERNALS] ? target[_utils.TARGET_INTERNALS].destroy() : null;
};

var toJSON = exports.toJSON = function toJSON(target) {
  return target && target[_utils.TARGET_INTERNALS] ? target[_utils.TARGET_INTERNALS].toJSON() : null;
};

var isTemporary = exports.isTemporary = function isTemporary(target) {
  return target && target[_utils.TARGET_INTERNALS] && target[_utils.TARGET_INTERNALS].temporary;
};

var setTemporary = exports.setTemporary = function setTemporary(target, value) {
  if (target && target[_utils.TARGET_INTERNALS]) {
    target[_utils.TARGET_INTERNALS].temporary = Boolean(value);
  }
};

var getStatus = exports.getStatus = function getStatus(target) {
  return target && target[_utils.TARGET_INTERNALS] ? target[_utils.TARGET_INTERNALS].status : '';
};

var isPending = exports.isPending = function isPending(value) {
  return getStatus(value) === _utils.TargetStatus.PENDING;
};

var getQueueLength = exports.getQueueLength = function getQueueLength(target) {
  var list = target && target[_utils.TARGET_INTERNALS] ? target[_utils.TARGET_INTERNALS].queue : null;
  return list ? list.length : 0;
};

var getQueueCommands = exports.getQueueCommands = function getQueueCommands(target) {
  var result = [];
  var queue = target && target[_utils.TARGET_INTERNALS] ? target[_utils.TARGET_INTERNALS].queue : null;
  if (queue) {
    var length = queue.length;
    // FIXME use Array.map()

    for (var index = 0; index < length; index++) {
      result.push(queue[index][0].type);
    }
  }
  return result;
};

var hadChildPromises = exports.hadChildPromises = function hadChildPromises(target) {
  return Boolean(target && target[_utils.TARGET_INTERNALS] && target[_utils.TARGET_INTERNALS].hadChildPromises);
};

var getRawPromise = exports.getRawPromise = function getRawPromise(target) {
  return target && target[_utils.TARGET_INTERNALS] ? target[_utils.TARGET_INTERNALS].promise : null;
};

var getRequestChildren = function getRequestChildren(target) {
  return target && target[_utils.TARGET_INTERNALS] ? target[_utils.TARGET_INTERNALS].children : null;
};

var getChildren = exports.getChildren = function getChildren(target) {
  var list = getRequestChildren(target);
  return list ? [].concat(_toConsumableArray(list)) : [];
};

var getLastChild = exports.getLastChild = function getLastChild(target) {
  var list = getRequestChildren(target);
  return list && list.length ? list[list.length - 1] : null;
};

var getChildrenCount = exports.getChildrenCount = function getChildrenCount(target) {
  var list = getRequestChildren(target);
  return list ? list.length : 0;
};

// FIXME Is it used? Why its similar to getChildrenCount()?
var sendRequest = exports.sendRequest = function sendRequest(target) {
  var list = getRequestChildren(target);
  return list ? list.length : 0;
};

var createRequestTarget = exports.createRequestTarget = function createRequestTarget(promise, requestHandlers) {
  return new RequestTarget(promise, requestHandlers);
};

exports.default = RequestTarget;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequestProxyFactory = exports.RequestProxyFactory = exports.createRequestHandlers = exports.RequestHandlers = exports.createRequestFactory = exports.RequestFactory = exports.createRequestTargetDecorator = exports.RequestTargetDecorator = exports.createRequestTarget = exports.RequestTarget = exports.RequestTargetInternals = exports.createRequestPackage = undefined;

var _utils = __webpack_require__(5);

var _RequestTargetInternals = __webpack_require__(16);

var _RequestTargetInternals2 = _interopRequireDefault(_RequestTargetInternals);

var _RequestTarget = __webpack_require__(2);

var _RequestTarget2 = _interopRequireDefault(_RequestTarget);

var _RequestTargetDecorator = __webpack_require__(18);

var _RequestTargetDecorator2 = _interopRequireDefault(_RequestTargetDecorator);

var _RequestFactory = __webpack_require__(19);

var _RequestFactory2 = _interopRequireDefault(_RequestFactory);

var _RequestHandlers = __webpack_require__(27);

var _RequestHandlers2 = _interopRequireDefault(_RequestHandlers);

var _RequestProxyFactory = __webpack_require__(28);

var _RequestProxyFactory2 = _interopRequireDefault(_RequestProxyFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.createRequestPackage = _utils.createRequestPackage;
exports.RequestTargetInternals = _RequestTargetInternals2.default;
exports.RequestTarget = _RequestTarget2.default;
exports.createRequestTarget = _RequestTarget.createRequestTarget;
exports.RequestTargetDecorator = _RequestTargetDecorator2.default;
exports.createRequestTargetDecorator = _RequestTargetDecorator.createRequestTargetDecorator;
exports.RequestFactory = _RequestFactory2.default;
exports.createRequestFactory = _RequestFactory.createRequestFactory;
exports.RequestHandlers = _RequestHandlers2.default;
exports.createRequestHandlers = _RequestHandlers.createRequestHandlers;
exports.RequestProxyFactory = _RequestProxyFactory2.default;
exports.createRequestProxyFactory = _RequestProxyFactory.createRequestProxyFactory;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResourcePoolRegistryEvents = exports.createResourcePoolRegistry = exports.ResourcePoolRegistry = exports.ResourceConverterEvents = exports.createResourceConverter = exports.ResourceConverter = exports.createTargetResource = exports.TargetResource = exports.ResourcePoolEvents = exports.createResourcePool = exports.ResourcePool = undefined;

var _ResourcePool = __webpack_require__(9);

var _ResourcePool2 = _interopRequireDefault(_ResourcePool);

var _TargetResource = __webpack_require__(11);

var _TargetResource2 = _interopRequireDefault(_TargetResource);

var _ResourceConverter = __webpack_require__(24);

var _ResourceConverter2 = _interopRequireDefault(_ResourceConverter);

var _ResourcePoolRegistry = __webpack_require__(25);

var _ResourcePoolRegistry2 = _interopRequireDefault(_ResourcePoolRegistry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.ResourcePool = _ResourcePool2.default;
exports.createResourcePool = _ResourcePool.createResourcePool;
exports.ResourcePoolEvents = _ResourcePool.ResourcePoolEvents;
exports.TargetResource = _TargetResource2.default;
exports.createTargetResource = _TargetResource.createTargetResource;
exports.ResourceConverter = _ResourceConverter2.default;
exports.createResourceConverter = _ResourceConverter.createResourceConverter;
exports.ResourceConverterEvents = _ResourceConverter.ResourceConverterEvents;
exports.ResourcePoolRegistry = _ResourcePoolRegistry2.default;
exports.createResourcePoolRegistry = _ResourcePoolRegistry.createResourcePoolRegistry;
exports.ResourcePoolRegistryEvents = _ResourcePoolRegistry.ResourcePoolRegistryEvents;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterRequestHandlers = exports.createRequestPackage = undefined;

var _createRequestPackage = __webpack_require__(22);

var _createRequestPackage2 = _interopRequireDefault(_createRequestPackage);

var _filterRequestHandlers = __webpack_require__(23);

var _filterRequestHandlers2 = _interopRequireDefault(_filterRequestHandlers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.createRequestPackage = _createRequestPackage2.default;
exports.filterRequestHandlers = _filterRequestHandlers2.default;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestTargetCommandFields = exports.RequestTargetCommandNames = exports.RequestTargetCommands = exports.Reserved = exports.ProxyCommandFields = exports.ProxyCommandNames = exports.ProxyCommands = exports.CommandHandlerFactory = exports.createDescriptors = exports.createCommandDescriptor = exports.CommandDescriptor = undefined;

var _CommandDescriptor = __webpack_require__(7);

var _CommandDescriptor2 = _interopRequireDefault(_CommandDescriptor);

var _CommandHandlerFactory = __webpack_require__(12);

var _CommandHandlerFactory2 = _interopRequireDefault(_CommandHandlerFactory);

var _ProxyCommands = __webpack_require__(8);

var _ProxyCommands2 = _interopRequireDefault(_ProxyCommands);

var _Reserved = __webpack_require__(26);

var _Reserved2 = _interopRequireDefault(_Reserved);

var _RequestTargetCommands = __webpack_require__(17);

var _RequestTargetCommands2 = _interopRequireDefault(_RequestTargetCommands);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.CommandDescriptor = _CommandDescriptor2.default;
exports.createCommandDescriptor = _CommandDescriptor.createCommandDescriptor;
exports.createDescriptors = _CommandDescriptor.createDescriptors;
exports.CommandHandlerFactory = _CommandHandlerFactory2.default;
exports.ProxyCommands = _ProxyCommands2.default;
exports.ProxyCommandNames = _ProxyCommands.ProxyCommandNames;
exports.ProxyCommandFields = _ProxyCommands.ProxyCommandFields;
exports.Reserved = _Reserved2.default;
exports.RequestTargetCommands = _RequestTargetCommands2.default;
exports.RequestTargetCommandNames = _RequestTargetCommands.RequestTargetCommandNames;
exports.RequestTargetCommandFields = _RequestTargetCommands.RequestTargetCommandFields;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDescriptors = exports.descriptorGeneratorFactory = exports.addDescriptorTo = exports.createCommandDescriptor = undefined;

var _ProxyCommands = __webpack_require__(8);

var _ProxyCommands2 = _interopRequireDefault(_ProxyCommands);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CommandDescriptor = function CommandDescriptor(type, handler, name) {
  _classCallCheck(this, CommandDescriptor);

  this.name = name !== undefined ? name : type;
  this.type = type;
  this.handler = handler;
  this.isTemporary = null;
  this.cacheable = false;
  this.virtual = false;
  this.resourceType = null;
};

var createCommandDescriptor = exports.createCommandDescriptor = function createCommandDescriptor(command, handler, name) {
  var descriptor = new CommandDescriptor(command, handler, name);
  // We can use Object.freeze(), it keeps class/constructor information
  return Object.freeze(descriptor);
};

var addDescriptorTo = exports.addDescriptorTo = function addDescriptorTo(descriptor, target) {
  if (target instanceof Array) {
    target.push(descriptor);
  } else if (target) {
    target[descriptor.name] = descriptor;
  }
};

var descriptorGeneratorFactory = exports.descriptorGeneratorFactory = function descriptorGeneratorFactory(command, name) {
  return function (handler, target, isTemporary, resourceType, cacheable) {
    var descriptor = new CommandDescriptor(command, handler, name);
    descriptor.isTemporary = isTemporary;
    descriptor.resourceType = resourceType;
    descriptor.cacheable = cacheable;
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };
};

var createDescriptors = exports.createDescriptors = function createDescriptors(handlers, target, isTemporary, resourceType, cacheable) {
  var list = _ProxyCommands2.default.list;
  var length = list.length;

  target = target || {};
  for (var index = 0; index < length; index++) {
    var name = list[index];
    var handler = handlers[name];
    var field = _ProxyCommands.ProxyCommandFields[name];

    if (handler instanceof Function) {
      var descriptor = new CommandDescriptor(name, handler, field);
      descriptor.isTemporary = isTemporary;
      descriptor.resourceType = resourceType;
      descriptor.cacheable = cacheable;
      descriptor = Object.freeze(descriptor);

      if (target instanceof Array) {
        target.push(descriptor);
      } else if (target) {
        target[field] = descriptor;
      }
    }
  }
  return target;
};

exports.default = CommandDescriptor;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProxyCommandFields = exports.ProxyCommandNames = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CommandDescriptor = __webpack_require__(7);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProxyCommandNames = exports.ProxyCommandNames = Object.freeze({
  GET: 'get',
  SET: 'set',
  APPLY: 'apply',
  DELETE_PROPERTY: 'deleteProperty'
});

var ProxyCommandFields = exports.ProxyCommandFields = Object.freeze({
  get: Symbol('proxy.commands::get'),
  set: Symbol('proxy.commands::set'),
  apply: Symbol('proxy.commands::apply'),
  deleteProperty: Symbol('proxy.commands::deleteProperty')
});

var ProxyCommands = function () {
  function ProxyCommands() {
    _classCallCheck(this, ProxyCommands);

    this.createGETDescriptor = (0, _CommandDescriptor.descriptorGeneratorFactory)(ProxyCommandNames.GET, ProxyCommandFields.get);
    this.createSETDescriptor = (0, _CommandDescriptor.descriptorGeneratorFactory)(ProxyCommandNames.SET, ProxyCommandFields.set);
    this.createAPPLYDescriptor = (0, _CommandDescriptor.descriptorGeneratorFactory)(ProxyCommandNames.APPLY, ProxyCommandFields.apply);

    Object.freeze(this);
  }

  _createClass(ProxyCommands, [{
    key: 'list',
    get: function get() {
      return [ProxyCommandNames.GET, ProxyCommandNames.SET, ProxyCommandNames.APPLY, ProxyCommandNames.DELETE_PROPERTY];
    }
  }, {
    key: 'required',
    get: function get() {
      return [ProxyCommandFields.GET, ProxyCommandFields.SET, ProxyCommandFields.APPLY];
    }
  }]);

  return ProxyCommands;
}();

exports.default = new ProxyCommands();

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createResourcePool = exports.getDefaultValidTargets = exports.setValidTargets = exports.isValidTarget = exports.ResourcePoolEvents = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _eventDispatcher = __webpack_require__(10);

var _eventDispatcher2 = _interopRequireDefault(_eventDispatcher);

var _utils = __webpack_require__(0);

var _TargetResource = __webpack_require__(11);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResourcePoolEvents = exports.ResourcePoolEvents = Object.freeze({
  RESOURCE_ADDED: 'resourceAdded',
  RESOURCE_REMOVED: 'resourceRemoved',
  POOL_CLEAR: 'poolClear',
  POOL_CLEARED: 'poolCleared',
  POOL_DESTROYED: 'poolDestroyed'
});

var MAP_FIELD = Symbol('ResourcePool::map');

var validTargets = {};

var isValidTarget = exports.isValidTarget = function isValidTarget(target) {
  return !(0, _utils.isResource)(target) && Boolean(validTargets[typeof target === 'undefined' ? 'undefined' : _typeof(target)]);
};

var setValidTargets = exports.setValidTargets = function setValidTargets(list) {
  validTargets = {};
  var length = list.length;

  for (var index = 0; index < length; index++) {
    validTargets[list[index]] = true;
  }
};

var getDefaultValidTargets = exports.getDefaultValidTargets = function getDefaultValidTargets() {
  return ['object', 'function'];
};

var ResourcePool = function (_EventDispatcher) {
  _inherits(ResourcePool, _EventDispatcher);

  function ResourcePool() {
    _classCallCheck(this, ResourcePool);

    var _this = _possibleConstructorReturn(this, (ResourcePool.__proto__ || Object.getPrototypeOf(ResourcePool)).call(this));

    _this[MAP_FIELD] = new Map();

    Object.defineProperties(_this, {
      id: {
        value: (0, _utils.getId)()
      }
    });
    return _this;
  }

  _createClass(ResourcePool, [{
    key: 'set',
    value: function set(target, type) {
      var link = null;
      if (isValidTarget(target)) {
        if (this[MAP_FIELD].has(target)) {
          link = this[MAP_FIELD].get(target);
        } else {
          link = (0, _TargetResource.createTargetResource)(this, target, type || (typeof target === 'undefined' ? 'undefined' : _typeof(target)));
          this[MAP_FIELD].set(link.id, link);
          this[MAP_FIELD].set(target, link);
          if (this.hasEventListener(ResourcePoolEvents.RESOURCE_ADDED)) {
            this.dispatchEvent(ResourcePoolEvents.RESOURCE_ADDED, link);
          }
        }
      }
      return link;
    }
  }, {
    key: 'has',
    value: function has(target) {
      return this[MAP_FIELD].has(target);
    }
  }, {
    key: 'get',
    value: function get(target) {
      return this[MAP_FIELD].get(target);
    }
  }, {
    key: 'remove',
    value: function remove(target) {
      var link = this[MAP_FIELD].get(target);
      if (link) {
        this[MAP_FIELD].delete(link.id);
        this[MAP_FIELD].delete(link.resource);
        if (this.hasEventListener(ResourcePoolEvents.RESOURCE_REMOVED)) {
          this.dispatchEvent(ResourcePoolEvents.RESOURCE_REMOVED, link);
        }
        link.destroy();
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      if (this.hasEventListener(ResourcePoolEvents.POOL_CLEAR)) {
        this.dispatchEvent(ResourcePoolEvents.POOL_CLEAR, this);
      }
      var key = void 0;
      var keys = this[MAP_FIELD].keys();
      // FIXME update to for...of loop when it comes to browsers
      while (!(key = keys.next()).done) {
        if (typeof key.value === 'string') {
          var link = this[MAP_FIELD].get(key.value);
          link.destroy();
        }
      }
      this[MAP_FIELD].clear();
      if (this.hasEventListener(ResourcePoolEvents.POOL_CLEARED)) {
        this.dispatchEvent(ResourcePoolEvents.POOL_CLEARED, this);
      }
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      return Boolean(this[MAP_FIELD]);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.clear();
      // intentionally make it not usable after its destroyed
      delete this[MAP_FIELD];
      if (this.hasEventListener(ResourcePoolEvents.POOL_DESTROYED)) {
        // FIXME why for second parameter?
        this.dispatchEvent(ResourcePoolEvents.POOL_DESTROYED, this);
      }
    }
  }]);

  return ResourcePool;
}(_eventDispatcher2.default);

var createResourcePool = exports.createResourcePool = function createResourcePool() {
  return new ResourcePool();
};

setValidTargets(getDefaultValidTargets());

exports.default = ResourcePool;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["EventDispatcher"] = factory();
	else
		root["EventDispatcher"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:8081/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Event = undefined;

var _EventDispatcher = __webpack_require__(1);

var _EventDispatcher2 = _interopRequireDefault(_EventDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _EventDispatcher2.default;
exports.Event = _EventDispatcher.Event;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var hasOwnProp = function hasOwnProp(target, name) {
  return Object.prototype.hasOwnProperty.call(target, name);
}; /**
    * Created by Oleg Galaburda on 09.02.16.
    * 
    */

var Event = exports.Event = function () {
  function Event(type, data) {
    _classCallCheck(this, Event);

    this.type = type;
    this.data = data || null;
    this.defaultPrevented = false;
  }

  _createClass(Event, [{
    key: 'toJSON',
    value: function toJSON() {
      return { type: this.type, data: this.data };
    }
  }, {
    key: 'isDefaultPrevented',
    value: function isDefaultPrevented() {
      return this.defaultPrevented;
    }
  }, {
    key: 'preventDefault',
    value: function preventDefault() {
      this.defaultPrevented = true;
    }
  }]);

  return Event;
}();

var ListenersRunner = function () {
  function ListenersRunner(listeners, onStopped, onComplete) {
    var _this = this;

    _classCallCheck(this, ListenersRunner);

    this.index = -1;
    this.immediatelyStopped = false;

    this.stopImmediatePropagation = function () {
      _this.immediatelyStopped = true;
    };

    this.listeners = listeners;
    this.onStopped = onStopped;
    this.onComplete = onComplete;
  }

  _createClass(ListenersRunner, [{
    key: 'run',
    value: function run(event, target) {
      var listener = void 0;
      var listeners = this.listeners;

      this.augmentEvent(event);
      // TODO this has to be handled in separate object ListenersRunner that should be
      // created for each call() call and asked for index validation on each listener remove.
      for (this.index = 0; this.index < listeners.length; this.index++) {
        if (this.immediatelyStopped) break;
        listener = listeners[this.index];
        listener.call(target, event);
      }
      this.clearEvent(event);
      this.onComplete(this);
    }
  }, {
    key: 'augmentEvent',
    value: function augmentEvent(eventObject) {
      var event = eventObject;
      event.stopPropagation = this.onStopped;
      event.stopImmediatePropagation = this.stopImmediatePropagation;
    }

    /* eslint class-methods-use-this: "off" */

  }, {
    key: 'clearEvent',
    value: function clearEvent(eventObject) {
      var event = eventObject;
      delete event.stopPropagation;
      delete event.stopImmediatePropagation;
    }
  }, {
    key: 'listenerRemoved',
    value: function listenerRemoved(listeners, index) {
      if (listeners === this.listeners && index <= this.index) {
        this.index--;
      }
    }
  }]);

  return ListenersRunner;
}();

var EventListeners = function () {
  function EventListeners() {
    var _this2 = this;

    _classCallCheck(this, EventListeners);

    this._listeners = {};
    this._runners = [];

    this.removeRunner = function (runner) {
      _this2._runners.splice(_this2._runners.indexOf(runner), 1);
    };
  }
  /**
   * key - event Type
   * value - hash of priorities
   *    key - priority
   *    value - list of handlers
   * @type {Object<string, Object.<string, Array<number, Function>>>}
   * @private
   */


  _createClass(EventListeners, [{
    key: 'createList',
    value: function createList(eventType, priorityOpt) {
      var priority = parseInt(priorityOpt, 10);
      var target = this.getPrioritiesByKey(eventType);
      var key = String(priority);
      var value = void 0;
      if (hasOwnProp(target, key)) {
        value = target[key];
      } else {
        value = [];
        target[key] = value;
      }
      return value;
    }
  }, {
    key: 'getPrioritiesByKey',
    value: function getPrioritiesByKey(key) {
      var value = void 0;
      if (hasOwnProp(this._listeners, key)) {
        value = this._listeners[key];
      } else {
        value = {};
        this._listeners[key] = value;
      }
      return value;
    }
  }, {
    key: 'add',
    value: function add(eventType, handler, priority) {
      var handlers = this.createList(eventType, priority);
      if (handlers.indexOf(handler) < 0) {
        handlers.push(handler);
      }
    }
  }, {
    key: 'has',
    value: function has(eventType) {
      var priority = void 0;
      var result = false;
      var priorities = this.getPrioritiesByKey(eventType);
      if (priorities) {
        for (priority in priorities) {
          if (hasOwnProp(priorities, priority)) {
            result = true;
            break;
          }
        }
      }
      return result;
    }
  }, {
    key: 'remove',
    value: function remove(eventType, handler) {
      var _this3 = this;

      var priorities = this.getPrioritiesByKey(eventType);
      if (priorities) {
        var list = Object.getOwnPropertyNames(priorities);
        var length = list.length;

        var _loop = function _loop(index) {
          var priority = list[index];
          var handlers = priorities[priority];
          var handlerIndex = handlers.indexOf(handler);
          if (handlerIndex >= 0) {
            handlers.splice(handlerIndex, 1);
            if (!handlers.length) {
              delete priorities[priority];
            }
            _this3._runners.forEach(function (runner) {
              runner.listenerRemoved(handlers, handlerIndex);
            });
          }
        };

        for (var index = 0; index < length; index++) {
          _loop(index);
        }
      }
    }
  }, {
    key: 'removeAll',
    value: function removeAll(eventType) {
      delete this._listeners[eventType];
    }
  }, {
    key: 'createRunner',
    value: function createRunner(handlers, onStopped) {
      var runner = new ListenersRunner(handlers, onStopped, this.removeRunner);
      this._runners.push(runner);
      return runner;
    }
  }, {
    key: 'call',
    value: function call(event, target) {
      var priorities = this.getPrioritiesByKey(event.type);
      var stopped = false;
      var stopPropagation = function stopPropagation() {
        stopped = true;
      };
      if (priorities) {
        // getOwnPropertyNames() or keys()?
        var list = Object.getOwnPropertyNames(priorities).sort(function (a, b) {
          return a - b;
        });
        var length = list.length;

        for (var index = 0; index < length; index++) {
          if (stopped) break;
          var _handlers = priorities[list[index]];
          // in case if all handlers of priority were removed while event
          // was dispatched and handlers become undefined.
          if (_handlers) {
            var _runner = this.createRunner(_handlers, stopPropagation);
            _runner.run(event, target);
            if (_runner.immediatelyStopped) break;
          }
        }
      }
    }
  }]);

  return EventListeners;
}();

var EventDispatcher = function () {
  function EventDispatcher(eventPreprocessor) {
    var noInit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, EventDispatcher);

    if (!noInit) {
      this.initialize(eventPreprocessor);
    }
  }

  /**
   * @private
   */


  _createClass(EventDispatcher, [{
    key: 'initialize',
    value: function initialize(eventPreprocessor) {
      this._eventPreprocessor = eventPreprocessor;
      this._listeners = new EventListeners();
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(eventType, listener) {
      var priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      this._listeners.add(eventType, listener, -priority || 0);
    }
  }, {
    key: 'hasEventListener',
    value: function hasEventListener(eventType) {
      return this._listeners.has(eventType);
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(eventType, listener) {
      this._listeners.remove(eventType, listener);
    }
  }, {
    key: 'removeAllEventListeners',
    value: function removeAllEventListeners(eventType) {
      this._listeners.removeAll(eventType);
    }
  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(event, data) {
      var eventObject = EventDispatcher.getEvent(event, data);
      if (this._eventPreprocessor) {
        eventObject = this._eventPreprocessor.call(this, eventObject);
      }
      this._listeners.call(eventObject);
    }
  }], [{
    key: 'isObject',
    value: function isObject(value) {
      return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null;
    }
  }, {
    key: 'getEvent',
    value: function getEvent(eventOrType, optionalData) {
      var event = eventOrType;
      if (!EventDispatcher.isObject(eventOrType)) {
        event = new EventDispatcher.Event(String(eventOrType), optionalData);
      }
      return event;
    }
  }, {
    key: 'create',
    value: function create(eventPreprocessor) {
      return new EventDispatcher(eventPreprocessor);
    }

    /* eslint no-undef: "off" */

  }]);

  return EventDispatcher;
}();

EventDispatcher.Event = Event;

exports.default = EventDispatcher;

/***/ })
/******/ ]);
});
//# sourceMappingURL=event-dispatcher.js.map

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTargetResource = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(0);

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getPoolId = function getPoolId(pool) {
  return pool ? pool.id : null;
};

/**
 * @exports TargetResource
 */

var TargetResource = function () {
  function TargetResource(pool, resource, type, id) {
    var _this = this,
        _Object$definePropert;

    _classCallCheck(this, TargetResource);

    this.toJSON = function () {
      return _defineProperty({}, _utils.TARGET_DATA, {
        id: _this.id,
        type: _this.type,
        poolId: _this.poolId
      });
    };

    Object.defineProperties(this, (_Object$definePropert = {}, _defineProperty(_Object$definePropert, _utils.TARGET_INTERNALS, {
      value: {
        pool: pool,
        resource: resource,
        type: type,
        id: id,
        active: true,
        poolId: getPoolId(pool)
      }
    }), _defineProperty(_Object$definePropert, _utils.TARGET_DATA, {
      get: this.toJSON
    }), _Object$definePropert));
  }

  _createClass(TargetResource, [{
    key: 'destroy',
    value: function destroy() {
      var id = this.id,
          pool = this.pool;

      var internals = this[_utils.TARGET_INTERNALS];

      if (!internals.active) {
        return;
      }

      internals.active = false;
      pool.remove(id);

      for (var name in internals) {
        delete internals[name];
      }
    }
  }, {
    key: 'active',
    get: function get() {
      return Boolean(this[_utils.TARGET_INTERNALS].active);
    }
  }, {
    key: 'resource',
    get: function get() {
      return this[_utils.TARGET_INTERNALS].resource;
    }
  }, {
    key: 'type',
    get: function get() {
      return this[_utils.TARGET_INTERNALS].type || _typeof(this[_utils.TARGET_INTERNALS].resource);
    }
  }, {
    key: 'id',
    get: function get() {
      return this[_utils.TARGET_INTERNALS].id;
    }
  }, {
    key: 'poolId',
    get: function get() {
      return this[_utils.TARGET_INTERNALS].poolId;
    }
  }]);

  return TargetResource;
}();

var createTargetResource = exports.createTargetResource = function createTargetResource(pool, resource, resourceType, id) {
  return new TargetResource(pool, resource, resourceType, id || (0, _utils.getId)());
};

exports.default = TargetResource;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(0);

var _request = __webpack_require__(3);

var _RequestTarget = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createCommandHandlerFor = function createCommandHandlerFor(factoryWrapper, propertyName, commandType, isTemporary, cacheable) {
  var factory = factoryWrapper.factory,
      checkState = factoryWrapper.checkState,
      getChildRequest = factoryWrapper.getChildRequest;


  function commandHandler(command, value) {
    var result = void 0;
    var promise = void 0;
    if (this[_utils.TARGET_INTERNALS]) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var pack = (0, _request.createRequestPackage)(commandType, [command, value].concat(args), this[_utils.TARGET_INTERNALS].id);
      // FIXME Explicitly pass scope
      var request = getChildRequest(propertyName, pack, cacheable);
      result = request.child;
      if (request.deferred) {
        promise = this[_utils.TARGET_INTERNALS].sendRequest(propertyName, pack, request.deferred, result);
        if (promise) {
          if (isTemporary) {
            // FIXME isTemporary must be called before `result` was resolved
            // FIXME remove default `isTemporary`, if not defined just skip
            checkState(promise, isTemporary, this, result, pack);
          }
        } else {
          result = null;
          promise = Promise.reject(new Error('Initial request failed and didn\'t result in promise.'));
        }
      }
    } else {
      promise = Promise.reject(new Error('Target object is not a resource, so cannot be used for calls.'));
    }
    return result || factory.create(promise);
  }

  return commandHandler;
};

var CommandHandlerFactory = function () {
  function CommandHandlerFactory() {
    var _this = this;

    var factory = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, CommandHandlerFactory);

    this.members = new Map();
    this.factory = null;

    this.getChildRequest = function (propertyName, pack, cacheable) {
      var child = void 0;
      var deferred = void 0;

      if (cacheable) {
        child = _this.factory.getCached(propertyName, pack);
      }

      if (!child) {
        deferred = (0, _utils.createDeferred)();
        if (cacheable) {
          child = _this.factory.createCached(deferred.promise, propertyName, pack);
        } else {
          child = _this.factory.create(deferred.promise, propertyName, pack);
        }
      }
      return { child: child, deferred: deferred };
    };

    this.checkState = function (promise, isTemporaryFn, parentRequest, childRequest, pack) {
      if (promise) {
        promise.then(function (data) {
          var isTemporary = Boolean(isTemporaryFn(parentRequest, childRequest, pack, data));
          (0, _RequestTarget.setTemporary)(childRequest, isTemporary);
        });
      }
    };

    this.setFactory(factory);
  }

  /**
   * @param {CommandDescriptor} descriptor
   * @returns {Function}
   * @private
   */


  _createClass(CommandHandlerFactory, [{
    key: 'get',
    value: function get(descriptor) {
      var propertyName = descriptor.name;
      if (!this.members.has(propertyName)) {
        this.members.set(propertyName, this.create(descriptor.name, descriptor.type, descriptor.isTemporary, descriptor.cacheable));
      }
      return this.members.get(propertyName);
    }
  }, {
    key: 'create',
    value: function create(propertyName, commandType, isTemporary, cacheable) {
      return createCommandHandlerFor(this, propertyName, commandType, isTemporary, cacheable);
    }
  }, {
    key: 'setFactory',
    value: function setFactory(factory) {
      this.factory = factory;
    }
  }]);

  return CommandHandlerFactory;
}();

exports.default = CommandHandlerFactory;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultResourcePool = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ResourcePool2 = __webpack_require__(9);

var _ResourcePool3 = _interopRequireDefault(_ResourcePool2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DefaultResourcePool = exports.DefaultResourcePool = function (_ResourcePool) {
  _inherits(DefaultResourcePool, _ResourcePool);

  function DefaultResourcePool() {
    _classCallCheck(this, DefaultResourcePool);

    return _possibleConstructorReturn(this, (DefaultResourcePool.__proto__ || Object.getPrototypeOf(DefaultResourcePool)).apply(this, arguments));
  }

  _createClass(DefaultResourcePool, [{
    key: 'destroy',

    // INFO default ResourcePool should not be destroyable;
    value: function destroy() {
      throw new Error('Default ResourcePool cannot be destroyed.');
    }
  }]);

  return DefaultResourcePool;
}(_ResourcePool3.default);

var defaultResourcePool = new DefaultResourcePool();

exports.default = defaultResourcePool;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isResourceConvertible = undefined;

var _resourceUtils = __webpack_require__(15);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Interface for all resource types, these will be treated as resources automatically
 * @interface
 * @alias DataAccessInterface.IConvertible
 */
var IConvertible = function IConvertible() {
  _classCallCheck(this, IConvertible);
};

var isResourceConvertible = exports.isResourceConvertible = function isResourceConvertible(data) {
  return (0, _resourceUtils.isResource)(data) || typeof data === 'function' || data instanceof IConvertible;
};

exports.default = IConvertible;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.areSameResource = exports.createForeignResource = exports.getResourceData = exports.getRawResource = exports.getResourceType = exports.getResourcePoolId = exports.getResourceId = exports.isResource = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utils = __webpack_require__(1);

var _request = __webpack_require__(3);

var _defaultResourcePool = __webpack_require__(13);

var _defaultResourcePool2 = _interopRequireDefault(_defaultResourcePool);

var _IConvertible = __webpack_require__(14);

var _IConvertible2 = _interopRequireDefault(_IConvertible);

var _TargetResource = __webpack_require__(11);

var _TargetResource2 = _interopRequireDefault(_TargetResource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isResource = exports.isResource = function isResource(object) {
  return object instanceof _TargetResource2.default || object instanceof _request.RequestTarget || object && (
  // this case for RequestTargets and TargetResources which contain
  // data in TARGET_INTERNALS Symbol
  // We check for their types above but in cases when Proxies are enabled
  // their type will be Function and verification will come to this case
  _typeof(object[_utils.TARGET_INTERNALS]) === 'object' ||
  // this case for RAW resources passed via JSON conversion,
  // look like {'resource::data': {id: '1111', poolId: '22222'}}
  _typeof(object[_utils.TARGET_DATA]) === 'object');
};

var getResourceId = exports.getResourceId = function getResourceId(object) {
  // if (object instanceof TargetResource || object instanceof RequestTarget) {
  if (_typeof(object[_utils.TARGET_INTERNALS]) === 'object') {
    return object[_utils.TARGET_INTERNALS];
  } else if (isResource(object)) {
    return object[_utils.TARGET_DATA].id;
  }

  return null;
};

var getResourcePoolId = exports.getResourcePoolId = function getResourcePoolId(object) {
  if (_typeof(object[_utils.TARGET_INTERNALS]) === 'object') {
    return object[_utils.TARGET_INTERNALS].poolId;
  } else if (isResource(object)) {
    return object[_utils.TARGET_DATA].poolId;
  }

  return null;
};

var getResourceType = exports.getResourceType = function getResourceType(object) {
  if (_typeof(object[_utils.TARGET_INTERNALS]) === 'object') {
    return object[_utils.TARGET_INTERNALS].type;
  } else if (isResource(object)) {
    return object[_utils.TARGET_DATA].type;
  }

  return null;
};

var getRawResource = exports.getRawResource = function getRawResource(object, pool) {
  pool = pool || _defaultResourcePool2.default;

  if (object instanceof _TargetResource2.default) {
    return object.toJSON();
  } else if (_typeof(object[_utils.TARGET_INTERNALS]) === 'object') {
    return _request.RequestTarget.toJSON(object);
  } else if (object instanceof _IConvertible2.default || typeof object === 'function') {
    return pool.set(object).toJSON();
  } else if (isResource(object)) {
    return object;
  }

  return null;
};

var getResourceData = exports.getResourceData = function getResourceData(object) {
  var data = getRawResource(object);
  return data ? data[_utils.TARGET_DATA] : null;
};

var createForeignResource = exports.createForeignResource = function createForeignResource(type) {
  var resource = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  resource[_utils.TARGET_DATA] = {
    id: 'foreign-id-' + (0, _utils.getId)(),
    type: type || (typeof resource === 'undefined' ? 'undefined' : _typeof(resource)),
    poolId: 'foreign-poolId-' + (0, _utils.getId)()
  };

  return resource;
};

var areSameResource = exports.areSameResource = function areSameResource(resource1, resource2) {
  return isResource(resource1) && isResource(resource2) && getResourceId(resource1) === getResourceId(resource2) && getResourcePoolId(resource1) === getResourcePoolId(resource2);
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = __webpack_require__(0);

var _utils2 = __webpack_require__(5);

var _utils3 = __webpack_require__(1);

var _RequestTarget = __webpack_require__(2);

var _RequestTargetCommands = __webpack_require__(17);

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @exports RequestTargetInternals
 */

var RequestTargetInternals = function () {

  /**
   * @class RequestTargetInternals
   * @param {DataAccessInterface.RequestTarget} _requestTarget
   * @param {Promise} _promise
   * @param {RequestHandlers} _requestHandlers
   * @mixin Promise
   */
  function RequestTargetInternals(requestTarget, promise, requestHandlers) {
    var _this = this;

    _classCallCheck(this, RequestTargetInternals);

    this.handlePromiseResolve = function (value) {
      _this.status = _utils.TargetStatus.RESOLVED;
      if ((0, _utils3.isResource)(value)) {
        _this.link = (0, _utils3.getResourceData)(value);
        /*
         INFO Sending "this" as result of resolve() handler, causes infinite
         loop of this.then(), so I've used wrapper object
        */
        // FIXME Check if Proxy wrapper will work with promise result, probably not
        value = { target: _this.requestTarget };
        _this.sendQueue();
        /*
        In theory, at time of these lines executing, "temporary" property should be
        already set via _commandHandler() set from RequestTargetDecorator
         */
        if (_this.temporary) {
          _this.destroy();
        }
      } else {
        // else { value must be passed as is }
        _this.rejectQueue('Target of the call is not a resource and call cannot be sent.');
      }
      _this.deferred.resolve(value);
      delete _this.deferred;
    };

    this.handlePromiseReject = function (value) {
      _this.status = _utils.TargetStatus.REJECTED;
      _this.rejectQueue('Target of the call was rejected and call cannot be sent.');
      _this.deferred.reject(value);
      delete _this.deferred;
    };

    this.requestHandlers = requestHandlers;
    this.requestTarget = requestTarget;
    this.link = {};
    // INFO this should be not initialized i.e. keep it undefined, this will be checked later
    this.temporary;
    this.hadChildPromises = false;
    this.status = _utils.TargetStatus.PENDING;
    this.queue = [];
    this.children = [];
    this.deferred = (0, _utils.createDeferred)();
    this.promise = this.deferred.promise.then(this.handlePromiseResolve, this.handlePromiseReject);
  }

  _createClass(RequestTargetInternals, [{
    key: 'sendQueue',
    value: function sendQueue() {
      while (this.queue && this.queue.length) {
        var _queue$shift = this.queue.shift(),
            _queue$shift2 = _slicedToArray(_queue$shift, 4),
            name = _queue$shift2[0],
            pack = _queue$shift2[1],
            deferred = _queue$shift2[2],
            child = _queue$shift2[3];

        pack.target = this.link.id;
        this.handleRequest(name, pack, deferred, child);
      }
      this.queue = null;
    }
  }, {
    key: 'rejectQueue',
    value: function rejectQueue(message) {
      var error = new Error(message || 'This request was rejected before sending.');
      while (this.queue && this.queue.length) {
        /**
         * @type {Array.<string, CommandDataPack, DataAccessInterface.Deferred>}
         */
        // FIXME [string, {type:string, cmd:string, value:*, target:string}, Deferred]
        var _queue$shift3 = this.queue.shift(),
            _queue$shift4 = _slicedToArray(_queue$shift3, 3),
            deferred = _queue$shift4[2];

        deferred.reject(error);
      }
      this.queue = null;
    }
  }, {
    key: 'sendRequest',
    value: function sendRequest(name, pack, deferred, child) {
      var promise = null;

      if (this.requestHandlers.hasHandler(name)) {
        promise = this.applyRequest(name, pack, deferred || (0, _utils.createDeferred)(), child);
      } else {
        throw new Error('Request handler for "' + name + '" is not registered.');
      }

      if (child) {
        this.registerChild(child);
      }

      return promise;
    }
  }, {
    key: 'addToQueue',
    value: function addToQueue(name, pack, deferred, child) {
      this.queue.push([name, pack, deferred, child]);
    }
  }, {
    key: 'applyRequest',
    value: function applyRequest(name, pack, deferred, child) {
      var promise = deferred.promise;


      switch (this.status) {
        case _utils.TargetStatus.PENDING:
          this.addToQueue(name, pack, deferred, child);
          break;
        case _utils.TargetStatus.REJECTED:
          promise = Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
          break;
        case _utils.TargetStatus.DESTROYED:
          promise = Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
          break;
        case _utils.TargetStatus.RESOLVED:
          this.handleRequest(name, pack, deferred, child);
          break;
        default:
          break;
      }

      return promise;
    }
  }, {
    key: 'handleRequest',
    value: function handleRequest(name, pack, deferred, child) {
      this.requestHandlers.handle(this.requestTarget, name, pack, deferred, child);
    }
  }, {
    key: 'registerChild',
    value: function registerChild(childRequestTarget) {
      var _this2 = this;

      var handleChildRequest = function handleChildRequest() {
        if (_this2.children) {
          var index = _this2.children.indexOf(childRequestTarget);
          if (index >= 0) {
            _this2.children.splice(index, 1);
          }
        }
      };

      this.children.push(childRequestTarget);
      (0, _RequestTarget.getRawPromise)(childRequestTarget).then(handleChildRequest, handleChildRequest);
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      return this.status === _utils.TargetStatus.PENDING || this.status === _utils.TargetStatus.RESOLVED;
    }
  }, {
    key: 'canBeDestroyed',
    value: function canBeDestroyed() {
      return this.status === _utils.TargetStatus.RESOLVED || this.status === _utils.TargetStatus.REJECTED;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var promise = null;
      if (this.canBeDestroyed()) {
        // INFO I should not clear children list, since they are pending and requests already sent.
        if (this.status === _utils.TargetStatus.RESOLVED) {
          promise = this.sendRequest(_RequestTargetCommands.RequestTargetCommandFields.DESTROY, (0, _utils2.createRequestPackage)(_RequestTargetCommands.RequestTargetCommandNames.DESTROY, [null, null], this.id));
        } else {
          promise = Promise.resolve();
        }
        this.status = _utils.TargetStatus.DESTROYED;
      } else {
        promise = Promise.reject(new Error('Invalid or already destroyed target.'));
      }
      return promise;
    }
  }, {
    key: 'then',
    value: function then(handleResolve, handleReject) {
      var child = this.promise.then(handleResolve, handleReject);
      this.hadChildPromises = true;
      return child;
    }
  }, {
    key: 'catch',
    value: function _catch(handleReject) {
      var child = this.promise.catch(handleReject);
      this.hadChildPromises = true;
      return child;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return _defineProperty({}, _utils.TARGET_DATA, {
        id: this.link.id,
        type: this.link.type,
        poolId: this.link.poolId
      });
    }
  }, {
    key: 'poolId',
    get: function get() {
      return this.link.poolId || null;
    }
  }, {
    key: 'type',
    get: function get() {
      return this.link.type || null;
    }
  }, {
    key: 'id',
    get: function get() {
      return this.link.id || null;
    }
  }]);

  return RequestTargetInternals;
}();

exports.default = RequestTargetInternals;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestTargetCommandFields = exports.RequestTargetCommandNames = undefined;

var _CommandDescriptor = __webpack_require__(7);

var _CommandDescriptor2 = _interopRequireDefault(_CommandDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RequestTargetCommandNames = exports.RequestTargetCommandNames = Object.freeze({
  DESTROY: '::destroy.resource'
});

var RequestTargetCommandFields = exports.RequestTargetCommandFields = Object.freeze({
  DESTROY: Symbol('::destroy.resource')
});

/**
 * Destroy is unique type that exists for every RequestTarget
 * and does not have a method on its instances. This type will
 * be send each time RequestTarget.destroy() is applied to
 * RequestTarget in stance.
 */

var RequestTargetCommands = function RequestTargetCommands() {
  _classCallCheck(this, RequestTargetCommands);

  this.createDESTROYDescriptor = function (handler, target) {
    var descriptor = new _CommandDescriptor2.default(RequestTargetCommandNames.DESTROY, handler, RequestTargetCommandFields.DESTROY);
    descriptor.virtual = true;
    (0, _CommandDescriptor.addDescriptorTo)(descriptor, target);
    return Object.freeze(descriptor);
  };

  Object.freeze(this);
};

exports.default = new RequestTargetCommands();

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequestTargetDecorator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CommandHandlerFactory = __webpack_require__(12);

var _CommandHandlerFactory2 = _interopRequireDefault(_CommandHandlerFactory);

var _resource = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RequestTargetDecorator = function () {

  /**
   * @param {RequestFactory} factory
   * @param {RequestHandlers} handlers
   * @private
   */
  function RequestTargetDecorator(factory, handlers) {
    _classCallCheck(this, RequestTargetDecorator);

    this.handlers = handlers;
    this.members = new _CommandHandlerFactory2.default(factory);
  }

  _createClass(RequestTargetDecorator, [{
    key: 'apply',
    value: function apply(request) {
      var result = void 0;

      if (!this.handlers.available) return;
      /* FIXME revert change when ES6 will be supported widely
       for (var descriptor of this.handlers) {
       request[descriptor.name] = this.getMember(descriptor.name, descriptor.type);
       }
       */

      var iterator = this.handlers.getHandlers((0, _resource.getResourceType)(request));
      while (!(result = iterator.next()).done) {
        var descriptor = result.value;
        request[descriptor.name] = this.members.get(descriptor);
      }
      return request;
    }
  }, {
    key: 'setFactory',
    value: function setFactory(factory) {
      if (factory) {
        this.members.setFactory(factory);
      }
    }
  }]);

  return RequestTargetDecorator;
}();

var createRequestTargetDecorator = exports.createRequestTargetDecorator = function createRequestTargetDecorator(factory, handlers) {
  return new RequestTargetDecorator(factory, handlers);
};

exports.default = RequestTargetDecorator;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequestFactory = exports.FACTORY_HANDLERS_FIELD = exports.FACTORY_DECORATOR_FIELD = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _RequestTargetDecorator = __webpack_require__(18);

var _RequestTarget = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FACTORY_DECORATOR_FIELD = exports.FACTORY_DECORATOR_FIELD = Symbol('request.factory::decorator');
var FACTORY_HANDLERS_FIELD = exports.FACTORY_HANDLERS_FIELD = Symbol('request.factory::handlers');

var RequestFactory = function () {
  /*
   function DummyCacheImpl() {
   this.get = function(name, pack) {
     };
   this.set = function(name, pack, request) {
     };
   }
   */
  function RequestFactory(handlers) {
    var cacheImpl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var noInit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, RequestFactory);

    if (noInit) {
      return;
    }

    this.cache = cacheImpl;
    this[FACTORY_HANDLERS_FIELD] = handlers;
    this[FACTORY_DECORATOR_FIELD] = (0, _RequestTargetDecorator.createRequestTargetDecorator)(this, handlers);
  }

  _createClass(RequestFactory, [{
    key: 'create',
    value: function create(promise) {
      var request = (0, _RequestTarget.createRequestTarget)(promise, this[FACTORY_HANDLERS_FIELD]);
      if (this[FACTORY_HANDLERS_FIELD].available) {
        this[FACTORY_DECORATOR_FIELD].apply(request);
      }
      return request;
    }
  }, {
    key: 'getCached',
    value: function getCached(name, pack) {
      return this.cache && this.cache.get(name, pack);
    }
  }, {
    key: 'createCached',
    value: function createCached(promise, name, pack) {
      var request = null;
      if (this.cache) {
        request = this.create(promise);
        this.cache.set(name, pack, request);
      }
      return request;
    }
  }]);

  return RequestFactory;
}();

var createRequestFactory = exports.createRequestFactory = function createRequestFactory(handlers, cacheImpl) {
  return new RequestFactory(handlers, cacheImpl);
};

exports.default = RequestFactory;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isResource = exports.getResourceType = exports.getResourcePoolId = exports.getResourceId = exports.getResourceData = exports.getRawResource = exports.isResourceConvertible = exports.IConvertible = exports.ResourceConverter = exports.ResourcePoolRegistry = exports.ResourcePool = exports.RequestTarget = exports.ProxyCommands = exports.RequestTargetCommands = exports.Reserved = exports.CommandDescriptor = exports.Deferred = exports.createDeferred = exports.dummy = exports.create = undefined;

var _DataAccessInterface = __webpack_require__(21);

var _DataAccessInterface2 = _interopRequireDefault(_DataAccessInterface);

var _utils = __webpack_require__(0);

var _commands = __webpack_require__(6);

var _request = __webpack_require__(3);

var _resource = __webpack_require__(4);

var _utils2 = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _DataAccessInterface2.default;
exports.create = _DataAccessInterface.create;
exports.dummy = _DataAccessInterface.dummy;
exports.createDeferred = _utils.createDeferred;
exports.Deferred = _utils.Deferred;
exports.CommandDescriptor = _commands.CommandDescriptor;
exports.Reserved = _commands.Reserved;
exports.RequestTargetCommands = _commands.RequestTargetCommands;
exports.ProxyCommands = _commands.ProxyCommands;
exports.RequestTarget = _request.RequestTarget;
exports.ResourcePool = _resource.ResourcePool;
exports.ResourcePoolRegistry = _resource.ResourcePoolRegistry;
exports.ResourceConverter = _resource.ResourceConverter;
exports.IConvertible = _utils2.IConvertible;
exports.isResourceConvertible = _utils2.isResourceConvertible;
exports.getRawResource = _utils2.getRawResource;
exports.getResourceData = _utils2.getResourceData;
exports.getResourceId = _utils2.getResourceId;
exports.getResourcePoolId = _utils2.getResourcePoolId;
exports.getResourceType = _utils2.getResourceType;
exports.isResource = _utils2.isResource;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dummy = exports.create = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @exports DataAccessInterface
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _utils = __webpack_require__(0);

var _request = __webpack_require__(3);

var _resource = __webpack_require__(4);

var _utils2 = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataAccessInterface = function () {

  /**
   * @class DataAccessInterface
   * @classdesc Facade of Deferred Data Access library, it holds all
   * of public API -- objects like ResourcePool and methods to work
   * with resources.
   * @param {CommandDescriptor[]|Object.<string, Function|CommandDescriptor>} descriptors
   * @param {boolean} [proxyEnabled=false]
   * @param {ResourcePoolRegistry} [poolRegistry]
   * @param {ResourcePool} [pool]
   * @param {ICacheImpl} [cacheImpl]
   */
  function DataAccessInterface(descriptors) {
    var proxyEnabled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var poolRegistry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var pool = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var cacheImpl = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    _classCallCheck(this, DataAccessInterface);

    this.poolRegistry = poolRegistry;
    this.pool = pool;
    this.cache = cacheImpl;
    this.initialize(descriptors, proxyEnabled);
  }

  _createClass(DataAccessInterface, [{
    key: 'initialize',
    value: function initialize(descriptors, proxyEnabled) {
      var _this = this;

      if (proxyEnabled && !(0, _utils.areProxiesAvailable)()) {
        throw new Error('Proxies are not available in this environment');
      }

      this.handlers = (0, _request.createRequestHandlers)(proxyEnabled);
      this.resourceConverter = (0, _resource.createResourceConverter)(this.factory, this.poolRegistry, this.pool, this.handlers);

      if (proxyEnabled) {
        this.factory = (0, _request.createRequestProxyFactory)(this.handlers, this.cache);
      } else {
        this.factory = (0, _request.createRequestFactory)(this.handlers, this.cache);
      }

      if (!this.poolRegistry) {
        this.poolRegistry = (0, _resource.createResourcePoolRegistry)();
      }

      if (this.pool) {
        this.poolRegistry.register(this.pool);
      } else if (this.pool !== undefined) {
        this.pool = this.poolRegistry.createPool();
      } else {
        this.pool = _utils2.defaultResourcePool;
      }

      var poolDestroyedHandler = function poolDestroyedHandler() {
        _this.pool.removeEventListener(_resource.ResourcePoolEvents.POOL_DESTROYED, poolDestroyedHandler);
        _this.pool = _this.poolRegistry.createPool();
        _this.pool.addEventListener(_resource.ResourcePoolEvents.POOL_DESTROYED, poolDestroyedHandler);
      };

      this.handlers.setHandlers(descriptors);
      this.pool.addEventListener(_resource.ResourcePoolEvents.POOL_DESTROYED, poolDestroyedHandler);
    }
  }, {
    key: 'parse',
    value: function parse(data) {
      return this.resourceConverter.parse(data);
    }
  }, {
    key: 'toJSON',
    value: function toJSON(data) {
      return this.resourceConverter.toJSON(data);
    }
  }, {
    key: 'isOwnResource',
    value: function isOwnResource(resource) {
      /**
       * @type {DataAccessInterface.ResourcePool}
       */
      var pool = void 0;
      if ((0, _utils2.isResource)(resource)) {
        pool = this.poolRegistry.get((0, _utils2.getResourcePoolId)(resource));
        return pool && pool.has((0, _utils2.getResourceId)(resource));
      }
      return false;
    }
  }, {
    key: 'proxyEnabled',
    get: function get() {
      return this.handlers.proxyEnabled;
    }
  }]);

  return DataAccessInterface;
}();

var create = exports.create = function create(handlers, proxyEnabled, poolRegistry, pool, cacheImpl) {
  return new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);
};

var dummy = exports.dummy = function dummy(handlers, proxyEnabled, poolRegistry, pool, cacheImpl) {
  var api = new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);
  return api.parse(handlers());
};

exports.default = DataAccessInterface;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var createRequestPackage = function createRequestPackage(type, args, targetId) {
  var result = {
    type: type,
    cmd: args[0], // cmd,
    value: args[1], // value,
    target: targetId
  };

  // FIXME why?
  Object.defineProperty(result, 'args', {
    value: args
  });

  return result;
};

exports.default = createRequestPackage;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _commands = __webpack_require__(6);

/**
 * Checks for CommandDescriptor uniqueness and reserved words usage.
 * @param {DataAccessInterface.CommandDescriptor} descriptor
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 * @private
 */
var applyDescriptor = function applyDescriptor(descriptor, descriptors, properties) {
  var name = descriptor.name;

  if (name in _commands.Reserved.names) {
    throw new Error('Name "' + name + '" is reserved and cannot be used in descriptor.');
  }
  if (Object.prototype.hasOwnProperty.call(descriptors, name) && descriptors[name] instanceof _commands.CommandDescriptor) {
    throw new Error('Field names should be unique, "' + String(name) + '" field has duplicates.');
  }
  descriptors[name] = descriptor;
  if (!descriptor.virtual) {
    properties.push(descriptor);
  }
};

/**
 * @param {Array} handlers
 * @param {Object} descriptors
 * @private
 */
var filterArray = function filterArray(handlers, descriptors, properties) {
  var length = handlers.length;

  for (var index = 0; index < length; index++) {
    var value = handlers[index];
    if (value instanceof _commands.CommandDescriptor) {
      applyDescriptor(value, descriptors, properties);
    }
  }
};

/**
 * @param {Object} handlers
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 * @private
 */
var filterHash = function filterHash(handlers, descriptors, properties) {
  if (!handlers) return;
  var keys = Object.getOwnPropertyNames(handlers).concat(Object.getOwnPropertySymbols(handlers));
  var length = keys.length;

  for (var index = 0; index < length; index++) {
    var name = keys[index];
    var value = handlers[name];
    if (typeof value === 'function') {
      value = (0, _commands.createCommandDescriptor)(name, value);
    }
    if (value instanceof _commands.CommandDescriptor) {
      applyDescriptor(value, descriptors, properties);
    }
  }
};

/**
 * @method RequestHandlers.filterHandlers
 * @param {Array|Object} handlers
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 */
var filterRequestHandlers = function filterRequestHandlers(handlers, descriptors, properties) {
  if (handlers instanceof Array) {
    filterArray(handlers, descriptors, properties);
  } else {
    filterHash(handlers, descriptors, properties);
  }
};

exports.default = filterRequestHandlers;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createResourceConverter = exports.ResourceConverterEvents = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventDispatcher = __webpack_require__(10);

var _eventDispatcher2 = _interopRequireDefault(_eventDispatcher);

var _utils = __webpack_require__(1);

var _RequestTarget = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResourceConverterEvents = exports.ResourceConverterEvents = Object.freeze({
  RESOURCE_CREATED: 'resourceCreated',
  RESOURCE_CONVERTED: 'resourceConverted'
});

/**
 * Resource converter contains bunch of methods to lookup for resources
 * and registering them, converting them into RAWResource or into
 * RequestTargets, depending on their origin.
 * Before sending data, bundled resources should be registered in ResourcePool
 * and then converted to RAWResource objects.
 * After data received, its RAWResources should be converted to RequestTargets
 * for not resolved resources or to resource target values otherwise.
 * Resource can be resolved by its `id` and `poolId`, if ResourceConverter
 * can find ResourcePool with id from poolId, it will try to get target
 * resource value and replace with it RAWResource object.
 * If ResourcePool not found, ResourceConverter assumes that resource come from
 * other origin/environment and creates RequestTarget object that can be target
 * object for commands.
 * ResourceConverter while handling data does not look deeply, so its developer
 * responsibility to convert deeply nested resource targets.
 * @param {RequestFactory} factory
 * @param {ResourcePoolRegistry} registry
 * @param {ResourcePool} pool
 * @param {RequestHandlers} handlers
 * @extends EventDispatcher
 */

var ResourceConverter = function (_EventDispatcher) {
  _inherits(ResourceConverter, _EventDispatcher);

  function ResourceConverter(factory, registry, pool) {
    var handlers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    _classCallCheck(this, ResourceConverter);

    var _this = _possibleConstructorReturn(this, (ResourceConverter.__proto__ || Object.getPrototypeOf(ResourceConverter)).call(this));

    _this.factory = factory;
    _this.pool = pool;
    _this.registry = registry;

    if (handlers) {
      handlers.setConverter(_this);
    }
    return _this;
  }

  _createClass(ResourceConverter, [{
    key: 'resourceToObject',
    value: function resourceToObject(data) {
      var result = void 0;

      if ((0, _utils.isResourceConvertible)(data)) {
        result = (0, _utils.getRawResource)(data, this.pool);
      } else if (typeof data.toJSON === 'function') {
        result = data.toJSON();
      } else {
        return data;
      }

      if (this.hasEventListener(ResourceConverterEvents.RESOURCE_CONVERTED)) {
        this.dispatchEvent(ResourceConverterEvents.RESOURCE_CONVERTED, {
          data: data,
          result: result
        });
      }

      return result;
    }

    /**
     * @method DataAccessInterface.ResourceConverter#objectToResource
     * @param {*} data
     * @returns {*}
     * @private
     */

  }, {
    key: 'objectToResource',
    value: function objectToResource(data) {
      var result = data;

      if ((0, _utils.isResource)(data)) {
        var poolId = (0, _utils.getResourcePoolId)(data);

        if (this.registry.isRegistered(poolId)) {
          // target object is stored in current pool
          var target = this.registry.get(poolId).get((0, _utils.getResourceId)(data));

          if (target) {
            result = target.resource;
          }
        } else {
          // target object has another origin, should be wrapped
          result = this.factory.create(Promise.resolve(data));
        }
      }

      if (result !== data && this.hasEventListener(ResourceConverterEvents.RESOURCE_CREATED)) {
        this.dispatchEvent(ResourceConverterEvents.RESOURCE_CREATED, {
          data: data,
          result: result
        });
      }

      return result;
    }

    /**
     * @method DataAccessInterface.ResourceConverter#lookupArray
     * @param list
     * @param linkConvertHandler
     * @returns {Array}
     * @private
     */

  }, {
    key: 'lookupArray',
    value: function lookupArray(list, linkConvertHandler) {
      var result = [];
      var length = list.length;

      for (var index = 0; index < length; index++) {
        // FIXME Array.map()
        result[index] = linkConvertHandler.call(this, list[index]);
      }
      return result;
    }

    /**
     * @method DataAccessInterface.ResourceConverter#lookupObject
     * @param {*} data
     * @param {Function} linkConvertHandler
     * @returns {*}
     * @private
     */

  }, {
    key: 'lookupObject',
    value: function lookupObject(data, linkConvertHandler) {
      var result = {};
      for (var name in data) {
        if (!Object.property.hasOwnProperty.call(data, name)) continue;
        result[name] = linkConvertHandler.call(this, data[name]);
      }
      return result;
    }

    /**
     * @method DataAccessInterface.ResourceConverter#toJSON
     * @param {*} data
     * @returns {*}
     * @private
     */

  }, {
    key: 'toJSON',
    value: function toJSON(data) {
      var result = data;

      if (data !== undefined && data !== null) {
        if ((0, _utils.isResourceConvertible)(data)) {
          // if data is RequestTarget, TargetResource, IConvertible, Function or RAW resource data
          result = this.resourceToObject(data);
        } else if (data instanceof Array) {
          // if data is Array of values, check its
          result = this.lookupArray(data, this.resourceToObject);
        } else if (data.constructor === Object) {
          // only Object instances can be looked up, other object types must be converted by hand
          result = this.lookupObject(data, this.resourceToObject);
        }
      }
      return result;
    }

    /**
     * @method DataAccessInterface.ResourceConverter#parse
     * @param {*} data
     * @returns {*}
     * @private
     */

  }, {
    key: 'parse',
    value: function parse(data) {
      var result = data;

      if (data !== undefined && data !== null) {
        if ((0, _utils.isResource)(data)) {
          // if data is RAW resource data
          result = this.objectToResource(data);
        } else if (data instanceof Array) {
          // if data is Array of values, check its
          result = this.lookupArray(data, this.objectToResource);
        } else if (data.constructor === Object) {
          result = this.lookupObject(data, this.objectToResource);
        }
      }

      return result;
    }

    /**
     * @method DataAccessInterface.ResourceConverter#lookupForPending
     * @param {*} data
     * @returns {Array}
     */

  }, {
    key: 'lookupForPending',
    value: function lookupForPending(data) {
      var result = [];

      var add = function add(value) {
        if ((0, _RequestTarget.isPending)(value)) {
          result.push(value);
        }
        return value;
      };

      if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && data !== null) {
        if ((0, _RequestTarget.isPending)(data)) {
          result.push(data);
        } else if (data instanceof Array) {
          this.lookupArray(data, add);
        } else if (data.constructor === Object) {
          this.lookupObject(data, add);
        }
      }
      return result;
    }
  }]);

  return ResourceConverter;
}(_eventDispatcher2.default);

/**
 * @param {RequestFactory} factory
 * @param {DataAccessInterface.ResourcePoolRegistry} registry
 * @param {DataAccessInterface.ResourcePool} pool
 * @param {RequestHandlers} handlers
 * @returns {ResourceConverter}
 */


var createResourceConverter = exports.createResourceConverter = function createResourceConverter(factory, registry, pool, handlers) {
  return new ResourceConverter(factory, registry, pool, handlers);
};

exports.default = ResourceConverter;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createResourcePoolRegistry = exports.ResourcePoolRegistryEvents = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventDispatcher = __webpack_require__(10);

var _eventDispatcher2 = _interopRequireDefault(_eventDispatcher);

var _utils = __webpack_require__(1);

var _utils2 = _interopRequireDefault(_utils);

var _ResourcePool = __webpack_require__(9);

var _ResourcePool2 = _interopRequireDefault(_ResourcePool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResourcePoolRegistryEvents = exports.ResourcePoolRegistryEvents = Object.freeze({
  RESOURCE_POOL_CREATED: 'resourcePoolCreated',
  RESOURCE_POOL_REGISTERED: 'resourcePoolRegistered',
  RESOURCE_POOL_REMOVED: 'resourcePoolRemoved'
});

var POOLS_FIELD = Symbol('resource.pool.registry::pools');

/**
 * @classdesc Collection of ResourcePool instances. Allows lookup for ResourcePool by its Id.
 * When ResourcePool is registered in ResourcePoolRegistry, it subscribes to
 * ResourcePool POOL_DESTROYED event and removes pool from registry after its destroyed.
 */

var ResourcePoolRegistry = function (_EventDispatcher) {
  _inherits(ResourcePoolRegistry, _EventDispatcher);

  function ResourcePoolRegistry() {
    _classCallCheck(this, ResourcePoolRegistry);

    var _this = _possibleConstructorReturn(this, (ResourcePoolRegistry.__proto__ || Object.getPrototypeOf(ResourcePoolRegistry)).call(this));

    _this[POOLS_FIELD] = {};

    // every registry should keep default pool, so you can have access from anywhere
    _this.register(_utils2.default);
    return _this;
  }

  _createClass(ResourcePoolRegistry, [{
    key: 'handlePoolDestroyed',
    value: function handlePoolDestroyed(event) {
      this.remove(event.data);
    }

    /**
     * Create and register ResourcePool
     * @returns {DataAccessInterface.ResourcePool} New ResourcePool instance
     */

  }, {
    key: 'createPool',
    value: function createPool() {
      var pool = (0, _ResourcePool.createResourcePool)();
      if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_CREATED)) {
        this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_CREATED, pool);
      }
      this.register(pool);
      return pool;
    }

    /**
     * Register ResourcePool instance.
     * @param pool {DataAccessInterface.ResourcePool} ResourcePool instance to be registered
     */

  }, {
    key: 'register',
    value: function register(pool) {
      if (Object.prototype.hasOwnProperty.call(this[POOLS_FIELD], pool.id)) return;
      this[POOLS_FIELD][pool.id] = pool;
      pool.addEventListener(_ResourcePool.ResourcePoolEvents.POOL_DESTROYED, this.handlePoolDestroyed);
      if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_REGISTERED)) {
        this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_REGISTERED, pool);
      }
    }

    /**
     * Retrieve ResourcePool instance from registry by its Id.
     * @param poolId {String} ResourcePool instance Id
     * @returns {DataAccessInterface.ResourcePool|null}
     */

  }, {
    key: 'get',
    value: function get(poolId) {
      return this[POOLS_FIELD][poolId] || null;
    }

    /**
     * Check if ResourcePool registered in this registry instance.
     * @param pool {DataAccessInterface.ResourcePool|String} ResourcePool instance or its Id.
     * @returns {Boolean}
     */

  }, {
    key: 'isRegistered',
    value: function isRegistered(pool) {
      return Object.prototype.hasOwnProperty.call(this[POOLS_FIELD], pool instanceof _ResourcePool2.default ? pool.id : String(pool));
    }

    /**
     * Remove ResourcePool from current registry instance.
     * @param pool {DataAccessInterface.ResourcePool|String} ResourcePool instance or its Id.
     * @returns {Boolean}
     */

  }, {
    key: 'remove',
    value: function remove(pool) {
      var result = false;
      pool = pool instanceof _ResourcePool2.default ? pool : this.get(pool);
      if (pool) {
        pool.removeEventListener(_ResourcePool2.default.Events.POOL_DESTROYED, this.handlePoolDestroyed);
        result = delete this[POOLS_FIELD][pool.id];
      }
      if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_REMOVED)) {
        this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_REMOVED, pool);
      }
      return result;
    }
  }]);

  return ResourcePoolRegistry;
}(_eventDispatcher2.default);

var createResourcePoolRegistry = exports.createResourcePoolRegistry = function createResourcePoolRegistry() {
  return new ResourcePoolRegistry();
};

exports.default = ResourcePoolRegistry;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Reserved words
 */
var Reserved = Object.freeze({
  /**
   * Contains property names that cannot be used for CommandDescriptor's
   */
  names: Object.freeze({
    // INFO Exposed Promise method, cannot be overwritten by type
    then: true,
    // INFO Exposed Promise method, cannot be overwritten by type
    catch: true
  })
});

exports.default = Reserved;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequestHandlers = exports.RequestHandlersEvents = exports.areProxyHandlersAvailable = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _commands = __webpack_require__(6);

var _utils = __webpack_require__(5);

var _utils2 = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Key for default type for handlers that will be applied to any
 * resource that does not have type-specific handlers registered
 * @type {string}
 */
var DEFAULT_KEY = '';

var areProxyHandlersAvailable = exports.areProxyHandlersAvailable = function areProxyHandlersAvailable(handlers, throwError) {
  var result = true;
  var list = _commands.ProxyCommands.required;
  var length = list.length;

  for (var index = 0; index < length; index++) {
    var name = list[index];
    if (!(_commands.ProxyCommandFields[name] in handlers)) {
      result = false;
      if (throwError) {
        throw new Error('For Proxy interface, handler "' + name + '" should be set.');
      }
    }
  }
  return result;
};

var RequestHandlersEvents = exports.RequestHandlersEvents = Object.freeze({
  HANDLERS_UPDATED: 'handlersUpdated'
});

var RequestHandlers = function () {

  /**
   * @class RequestHandlers
   * @param {boolean} proxyEnabled
   * @private
   */
  function RequestHandlers(proxyEnabled) {
    _classCallCheck(this, RequestHandlers);

    // named collection of CommandDescriptor lists that may be applied
    this.properties = {};
    this.descriptors = {};
    this.proxyEnabled = Boolean(proxyEnabled);
    this.converter = null;
  }

  _createClass(RequestHandlers, [{
    key: 'setConverter',
    value: function setConverter(converter) {
      this.converter = converter;
    }
  }, {
    key: 'setHandlers',
    value: function setHandlers(handlers) {
      var _this = this;

      this.setHandlersByType(DEFAULT_KEY, handlers);

      Object.keys(handlers).forEach(function (name) {
        var type = handlers[name];
        if (type && (type.constructor === Object || type instanceof Array)) {
          _this.setHandlersByType(name, type);
        }
      });

      if (this.proxyEnabled) {
        areProxyHandlersAvailable(this.descriptors, true);
      }
    }
  }, {
    key: 'setHandlersByType',
    value: function setHandlersByType(type, handlers) {
      var descrs = {};
      var props = [];
      (0, _utils.filterRequestHandlers)(handlers, descrs, props);
      this.descriptors[type] = descrs;
      this.properties[type] = props;
    }

    /**
     * @method RequestHandlers#hasHandler
     * @param {String|Symbol} name Property name of CommandDescriptor
     * @param {String} [type] Resource type for type-specific handlers
     * @returns {boolean}
     */

  }, {
    key: 'hasHandler',
    value: function hasHandler(name, type) {
      return this.descriptors[type] && Object.prototype.hasOwnProperty.call(this.descriptors[type], name) || this.descriptors[DEFAULT_KEY] && Object.prototype.hasOwnProperty.call(this.descriptors[DEFAULT_KEY], name);
    }

    /**
     * IMPORTANT: Returns original list of CommandDescriptors, changing it may cause
     * unexpected result with newly decorated resources.
     * @param {String} [type]
     * @returns {CommandDescriptor[]|null}
     * @private
     */

  }, {
    key: 'getHandlers',
    value: function getHandlers(type) {
      var descrs = this.descriptors[type || DEFAULT_KEY];
      if (!descrs) {
        descrs = this.descriptors[DEFAULT_KEY];
      }

      return descrs || null;
    }

    /**
     * @method RequestHandlers#getHandler
     * @param name
     * @param {String} [type]
     * @returns {*|null}
     * @private
     */

  }, {
    key: 'getHandler',
    value: function getHandler(name, type) {
      var handler = this.descriptors[type] && this.descriptors[type][name] || this.descriptors[DEFAULT_KEY] && this.descriptors[DEFAULT_KEY][name];

      return handler || null;
    }

    /**
     * @method RequestHandlers#handle
     * @param {DataAccessInterface.RequestTarget} parentRequest
     * @param {String|Symbol} name
     * @param {CommandDataPack} pack
     * @param {DataAccessInterface.Deferred} deferred
     * @param {DataAccessInterface.RequestTarget} [resultRequest]
     * @private
     */

  }, {
    key: 'handle',
    value: function handle(parentRequest, name, pack, deferred, resultRequest) {
      var _this2 = this;

      var list = this.converter ? this.converter.lookupForPending(pack.value) : null;
      if (list && list.length) {
        // FIXME Need to test on all platforms: In other browsers this might not work
        // because may need list of Promise objects, not RequestTargets
        Promise.all(list).then(function () {
          _this2.handleImmediately(parentRequest, name, pack, deferred, resultRequest);
        });
      } else {
        this.handleImmediately(parentRequest, name, pack, deferred, resultRequest);
      }
    }

    /**
     *
     * @param {DataAccessInterface.RequestTarget} parentRequest
     * @param {String|Symbol} name
     * @param {CommandDataPack} data
     * @param {DataAccessInterface.Deferred} deferred
     * @param {DataAccessInterface.RequestTarget} [resultRequest]
     * @private
     */

  }, {
    key: 'handleImmediately',
    value: function handleImmediately(parentRequest, name, data, deferred, resultRequest) {
      /**
       * @type {DataAccessInterface.CommandDescriptor|null}
       */
      var handler = this.getHandler(name, (0, _utils2.getResourceType)(parentRequest));
      if (handler instanceof _commands.CommandDescriptor) {
        // INFO result should be applied to deferred.resolve() or deferred.reject()
        handler.handler(parentRequest, data, deferred, resultRequest);
      } else {
        throw new Error('Command descriptor for "' + name + '" was not found.');
      }
    }
  }, {
    key: 'available',
    get: function get() {
      var nonEmptyList = Object.keys(this.properties).find(function (item) {
        return Boolean(item && item.length);
      });
      return Boolean(nonEmptyList);
    }
  }]);

  return RequestHandlers;
}();

/**
 * @member RequestHandlers.create
 * @param {Boolean} proxyEnabled
 * @returns {RequestHandlers}
 */


var createRequestHandlers = exports.createRequestHandlers = function createRequestHandlers(proxyEnabled) {
  return new RequestHandlers(proxyEnabled);
};

exports.default = RequestHandlers;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequestProxyFactory = exports.applyProxyWithDefaultHandlers = exports.createProxyHandlers = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _RequestFactory2 = __webpack_require__(19);

var _RequestFactory3 = _interopRequireDefault(_RequestFactory2);

var _ProxyCommands = __webpack_require__(8);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FACTORY_FIELD = Symbol('request.proxy.factory::factory');

var EXCLUSIONS = {
  /*
   INFO arguments and caller were included because they are required function properties
   */
  arguments: true,
  caller: true,
  prototype: true
};

var wrapWithProxy = function wrapWithProxy(target, handlers) {
  // INFO Target must be a function so I could use Proxy.call() interceptor.
  function requestTargetProxy() {}

  requestTargetProxy.target = target;
  return new Proxy(requestTargetProxy, handlers);
};

var proxyGet = function proxyGet(wrapper, name) {
  var target = wrapper.target;

  if (name in target || name in EXCLUSIONS || (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'symbol') {
    return target[name];
  }
  // INFO Proxy should be already applied, so no need in additional wrapping
  return target[_ProxyCommands.ProxyCommandFields.get](name);
};

// INFO Proxy should be already applied, so no need in additional wrapping
var proxyApply = function proxyApply(wrapper, thisValue, args) {
  return wrapper.target[_ProxyCommands.ProxyCommandFields.apply](null, args);
};

var proxySet = function proxySet(wrapper, name, value) {
  var target = wrapper.target;


  if (name in target || name in EXCLUSIONS || (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'symbol') {
    target[name] = value;
    return value;
  }

  return target[_ProxyCommands.ProxyCommandFields.set](name, value);
};

var proxyHas = function proxyHas(wrapper, name) {
  return Object.prototype.hasOwnProperty.call(wrapper.target, name);
};

var proxyDeleteProperty = function proxyDeleteProperty(wrapper, name) {
  var target = wrapper.target;


  if (_ProxyCommands.ProxyCommandFields.deleteProperty in target) {
    target[_ProxyCommands.ProxyCommandFields.deleteProperty](name);
    return true;
  }

  return false;
};

var proxyOwnKeys = function proxyOwnKeys() {
  return Object.getOwnPropertyNames(EXCLUSIONS);
};

var proxyEnumerate = function proxyEnumerate() {
  return Object.getOwnPropertyNames(EXCLUSIONS)[Symbol.iterator]();
};

var proxyGetOwnPropertyDescriptor = function proxyGetOwnPropertyDescriptor(wrapper, name) {
  if (Object.prototype.hasOwnProperty.call(EXCLUSIONS, name)) {
    return Object.getOwnPropertyDescriptor(wrapper, name);
  }
  return Object.getOwnPropertyDescriptor(wrapper.target, name);
};

/**
 * Builds proper handlers hash for Proxy
 * @returns {Function}
 */
var createProxyHandlers = exports.createProxyHandlers = function createProxyHandlers() {
  var handlers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Object.assign({
    get: proxyGet,
    apply: proxyApply,
    set: proxySet,
    has: proxyHas,
    deleteProperty: proxyDeleteProperty,
    ownKeys: proxyOwnKeys,
    enumerate: proxyEnumerate,
    getOwnPropertyDescriptor: proxyGetOwnPropertyDescriptor
  }, handlers);
};

var PROXY_HANDLERS = createProxyHandlers();

var RequestProxyFactory = function (_RequestFactory) {
  _inherits(RequestProxyFactory, _RequestFactory);

  function RequestProxyFactory(handlers, cacheImpl) {
    _classCallCheck(this, RequestProxyFactory);

    var _this = _possibleConstructorReturn(this, (RequestProxyFactory.__proto__ || Object.getPrototypeOf(RequestProxyFactory)).call(this, null, null, true));

    _this[_RequestFactory2.FACTORY_HANDLERS_FIELD] = handlers;
    _this[FACTORY_FIELD] = _RequestFactory3.default.create(handlers, cacheImpl);
    _this[FACTORY_FIELD][_RequestFactory2.FACTORY_DECORATOR_FIELD].setFactory(_this);
    return _this;
  }

  _createClass(RequestProxyFactory, [{
    key: 'create',
    value: function create(promise) {
      var instance = this[FACTORY_FIELD].create(promise);

      if (this[_RequestFactory2.FACTORY_HANDLERS_FIELD].available) {
        return wrapWithProxy(instance, PROXY_HANDLERS);
      }

      return instance;
    }
  }, {
    key: 'getCached',
    value: function getCached(name, pack) {
      return this[FACTORY_FIELD].getCached(name, pack);
    }
  }, {
    key: 'createCached',
    value: function createCached(promise, name, pack) {
      var instance = this[FACTORY_FIELD].createCached(promise, name, pack);

      if (this[_RequestFactory2.FACTORY_HANDLERS_FIELD].available) {
        return wrapWithProxy(instance, PROXY_HANDLERS);
      }

      return instance;
    }
  }]);

  return RequestProxyFactory;
}(_RequestFactory3.default);

var applyProxyWithDefaultHandlers = exports.applyProxyWithDefaultHandlers = function applyProxyWithDefaultHandlers(target) {
  return wrapWithProxy(target, PROXY_HANDLERS);
};

var createRequestProxyFactory = exports.createRequestProxyFactory = function createRequestProxyFactory(handlers, cacheImpl) {
  return new RequestProxyFactory(handlers, cacheImpl);
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=deferred-data-access.js.map