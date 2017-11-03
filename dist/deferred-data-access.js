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
/******/ 	return __webpack_require__(__webpack_require__.s = 25);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__request_RequestTarget__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__resource_TargetResource__ = __webpack_require__(10);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };






/* harmony default export */ __webpack_exports__["a"] = (function (object) {
  return object instanceof __WEBPACK_IMPORTED_MODULE_3__resource_TargetResource__["b" /* default */] || object instanceof __WEBPACK_IMPORTED_MODULE_2__request_RequestTarget__["b" /* default */] || object && (
  // this case for RequestTargets and TargetResources which contain
  // data in TARGET_INTERNALS Symbol
  // We check for their types above but in cases when Proxies are enabled
  // their type will be Function and verification will come to this case
  _typeof(object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]]) === 'object' ||
  // this case for RAW resources passed via JSON conversion,
  // look like {'resource::data': {id: '1111', poolId: '22222'}}
  _typeof(object[__WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__["a" /* default */]]) === 'object');
});

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (Symbol('request.target:internals'));

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ('resource::data');

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isActive */
/* unused harmony export canBeDestroyed */
/* unused harmony export destroy */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return toJSON; });
/* unused harmony export isTemporary */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return setTemporary; });
/* unused harmony export getStatus */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return isPending; });
/* unused harmony export getQueueLength */
/* unused harmony export getQueueCommands */
/* unused harmony export hadChildPromises */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return getRawPromise; });
/* unused harmony export getChildren */
/* unused harmony export getLastChild */
/* unused harmony export getChildrenCount */
/* unused harmony export sendRequest */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createRequestTarget; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__RequestTargetInternals__ = __webpack_require__(28);
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }






var PROMISE_FIELD = Symbol('request.target::promise');

var getRequestPromise = function getRequestPromise(request) {
  return request[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] || request[PROMISE_FIELD];
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

    this[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] = new __WEBPACK_IMPORTED_MODULE_3__RequestTargetInternals__["a" /* default */](this, promise, requestHandlers);

    var handlePromise = function handlePromise(data) {
      if (!Object(__WEBPACK_IMPORTED_MODULE_2__utils_isResource__["a" /* default */])(data)) {
        _this[PROMISE_FIELD] = promise;
        delete _this[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]];
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

var isActive = function isActive(target) {
  return target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] ? target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].isActive() : false;
};

var canBeDestroyed = function canBeDestroyed(target) {
  return target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] ? target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].canBeDestroyed() : false;
};

var destroy = function destroy(target) {
  return target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] ? target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].destroy() : null;
};

var toJSON = function toJSON(target) {
  return target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] ? target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].toJSON() : null;
};

var isTemporary = function isTemporary(target) {
  return target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].temporary;
};

var setTemporary = function setTemporary(target, value) {
  if (target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]]) {
    target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].temporary = Boolean(value);
  }
};

var getStatus = function getStatus(target) {
  return target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] ? target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].status : null;
};

var isPending = function isPending(value) {
  return getStatus(value) === __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].PENDING;
};

var getQueueLength = function getQueueLength(target) {
  var list = target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] ? target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].queue : null;
  return list ? list.length : 0;
};

var getQueueCommands = function getQueueCommands(target) {
  var queue = target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] ? target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].queue : null;
  if (queue) {
    return queue.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          name = _ref2[0];

      return name;
    });
    // return queue.map(([name, pack]) => pack.type);
  }
  return [];
};

var hadChildPromises = function hadChildPromises(target) {
  return Boolean(target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].hadChildPromises);
};

var getRawPromise = function getRawPromise(target) {
  return target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] ? target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].promise : null;
};

var getRequestChildren = function getRequestChildren(target) {
  return target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] ? target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].children : null;
};

var getChildren = function getChildren(target) {
  var list = getRequestChildren(target);
  return list ? [].concat(_toConsumableArray(list)) : [];
};

var getLastChild = function getLastChild(target) {
  var list = getRequestChildren(target);
  return list && list.length ? list[list.length - 1] : null;
};

var getChildrenCount = function getChildrenCount(target) {
  var list = getRequestChildren(target);
  return list ? list.length : 0;
};

// FIXME Is it used? Why its similar to getChildrenCount()?
var sendRequest = function sendRequest(target) {
  var list = getRequestChildren(target);
  return list ? list.length : 0;
};

var createRequestTarget = function createRequestTarget(promise, requestHandlers) {
  return new RequestTarget(promise, requestHandlers);
};

/* harmony default export */ __webpack_exports__["b"] = (RequestTarget);

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export DEFAULT_IS_TEMPORARY */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return createCommandDescriptor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return addDescriptorTo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return descriptorGeneratorFactory; });
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_IS_TEMPORARY = function DEFAULT_IS_TEMPORARY() {
  return false;
};

var CommandDescriptor = function () {
  function CommandDescriptor(type, handler, name) {
    _classCallCheck(this, CommandDescriptor);

    this.name = name !== undefined ? name : type;
    this.type = type;
    this.handler = handler;
    /**
     * @type {function(): boolean}
     */
    this.isTemporary = DEFAULT_IS_TEMPORARY;
    this.cacheable = true;
    this.virtual = false;
    this.resourceType = null;
  }

  _createClass(CommandDescriptor, [{
    key: "toString",
    value: function toString() {
      return "[CommandDescriptor(name=\"" + String(this.name) + "\", " + ("type=\"" + String(this.type) + "\", virtual=\"" + this.virtual + "\")]");
    }
  }]);

  return CommandDescriptor;
}();

var createCommandDescriptor = function createCommandDescriptor(command, handler, name) {
  var isTemporary = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
  var resourceType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var cacheable = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  var virtual = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

  var descriptor = new CommandDescriptor(command, handler, name);
  descriptor.resourceType = resourceType;
  descriptor.cacheable = cacheable;
  descriptor.virtual = virtual;
  if (isTemporary) {
    descriptor.isTemporary = isTemporary;
  }
  // We can use Object.freeze(), it keeps class/constructor information
  return Object.freeze(descriptor);
};

var addDescriptorTo = function addDescriptorTo(descriptor, target) {
  if (target instanceof Array) {
    target.push(descriptor);
  } else if (target) {
    target[descriptor.name] = descriptor;
  }
};

var descriptorGeneratorFactory = function descriptorGeneratorFactory(command, name) {
  return function (handler, target) {
    var isTemporary = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_IS_TEMPORARY;
    var resourceType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var cacheable = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
    var virtual = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    var descriptor = createCommandDescriptor(command, handler, name, isTemporary, resourceType, cacheable, virtual);
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };
};

/* harmony default export */ __webpack_exports__["c"] = (CommandDescriptor);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ResourcePoolEvents; });
/* unused harmony export isValidTarget */
/* unused harmony export setValidTargets */
/* unused harmony export getDefaultValidTargets */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return defaultResourcePool; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return createResourcePool; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_getId__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__TargetResource__ = __webpack_require__(10);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }






var ResourcePoolEvents = Object.freeze({
  RESOURCE_ADDED: 'resourceAdded',
  RESOURCE_REMOVED: 'resourceRemoved',
  POOL_CLEAR: 'poolClear',
  POOL_CLEARED: 'poolCleared',
  POOL_DESTROYED: 'poolDestroyed'
});

var MAP_FIELD = Symbol('ResourcePool::map');

var validTargets = {};

var isValidTarget = function isValidTarget(target) {
  return !Object(__WEBPACK_IMPORTED_MODULE_2__utils_isResource__["a" /* default */])(target) && Boolean(validTargets[typeof target === 'undefined' ? 'undefined' : _typeof(target)]);
};

var setValidTargets = function setValidTargets(list) {
  validTargets = {};
  var length = list.length;

  for (var index = 0; index < length; index++) {
    validTargets[list[index]] = true;
  }
};

var getDefaultValidTargets = function getDefaultValidTargets() {
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
        value: Object(__WEBPACK_IMPORTED_MODULE_1__utils_getId__["a" /* default */])()
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
          link = Object(__WEBPACK_IMPORTED_MODULE_3__TargetResource__["a" /* createTargetResource */])(this, target, type || (typeof target === 'undefined' ? 'undefined' : _typeof(target)));
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
}(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default.a);

var DefaultResourcePool = function (_ResourcePool) {
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
}(ResourcePool);

var defaultResourcePool = new DefaultResourcePool();

var createResourcePool = function createResourcePool() {
  return new ResourcePool();
};

setValidTargets(getDefaultValidTargets());

/* harmony default export */ __webpack_exports__["c"] = (ResourcePool);

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createDeferred; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Deferred = function Deferred() {
  var _this = this;

  _classCallCheck(this, Deferred);

  this.promise = new Promise(function (resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
  });
};

var createDeferred = function createDeferred() {
  return new Deferred();
};
/* harmony default export */ __webpack_exports__["b"] = (Deferred);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__IConvertible__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__request_RequestTarget__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__resource_ResourcePool__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__resource_TargetResource__ = __webpack_require__(10);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };








/* harmony default export */ __webpack_exports__["a"] = (function (object, pool) {
  pool = pool || __WEBPACK_IMPORTED_MODULE_4__resource_ResourcePool__["d" /* defaultResourcePool */];

  if (object instanceof __WEBPACK_IMPORTED_MODULE_5__resource_TargetResource__["b" /* default */]) {
    return object.toJSON();
  } else if (_typeof(object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]]) === 'object') {
    return Object(__WEBPACK_IMPORTED_MODULE_3__request_RequestTarget__["f" /* toJSON */])(object);
  } else if (object instanceof __WEBPACK_IMPORTED_MODULE_1__IConvertible__["a" /* default */] || typeof object === 'function') {
    return pool.set(object).toJSON();
  } else if (Object(__WEBPACK_IMPORTED_MODULE_2__isResource__["a" /* default */])(object)) {
    return object;
  }

  return null;
});

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Interface for all resource types, these will be treated as resources automatically
 * @interface
 * @alias DataAccessInterface.IConvertible
 */
var IConvertible = function IConvertible() {
  _classCallCheck(this, IConvertible);
};

/* harmony default export */ __webpack_exports__["a"] = (IConvertible);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function webpackUniversalModuleDefinition(root, factory) {
  if (( false ? 'undefined' : _typeof2(exports)) === 'object' && ( false ? 'undefined' : _typeof2(module)) === 'object') module.exports = factory();else if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else if ((typeof exports === 'undefined' ? 'undefined' : _typeof2(exports)) === 'object') exports["EventDispatcher"] = factory();else root["EventDispatcher"] = factory();
})(this, function () {
  return (/******/function (modules) {
      // webpackBootstrap
      /******/ // The module cache
      /******/var installedModules = {};
      /******/
      /******/ // The require function
      /******/function __webpack_require__(moduleId) {
        /******/
        /******/ // Check if module is in cache
        /******/if (installedModules[moduleId]) {
          /******/return installedModules[moduleId].exports;
          /******/
        }
        /******/ // Create a new module (and put it into the cache)
        /******/var module = installedModules[moduleId] = {
          /******/i: moduleId,
          /******/l: false,
          /******/exports: {}
          /******/ };
        /******/
        /******/ // Execute the module function
        /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/
        /******/ // Flag the module as loaded
        /******/module.l = true;
        /******/
        /******/ // Return the exports of the module
        /******/return module.exports;
        /******/
      }
      /******/
      /******/
      /******/ // expose the modules object (__webpack_modules__)
      /******/__webpack_require__.m = modules;
      /******/
      /******/ // expose the module cache
      /******/__webpack_require__.c = installedModules;
      /******/
      /******/ // define getter function for harmony exports
      /******/__webpack_require__.d = function (exports, name, getter) {
        /******/if (!__webpack_require__.o(exports, name)) {
          /******/Object.defineProperty(exports, name, {
            /******/configurable: false,
            /******/enumerable: true,
            /******/get: getter
            /******/ });
          /******/
        }
        /******/
      };
      /******/
      /******/ // getDefaultExport function for compatibility with non-harmony modules
      /******/__webpack_require__.n = function (module) {
        /******/var getter = module && module.__esModule ?
        /******/function getDefault() {
          return module['default'];
        } :
        /******/function getModuleExports() {
          return module;
        };
        /******/__webpack_require__.d(getter, 'a', getter);
        /******/return getter;
        /******/
      };
      /******/
      /******/ // Object.prototype.hasOwnProperty.call
      /******/__webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      /******/
      /******/ // __webpack_public_path__
      /******/__webpack_require__.p = "http://localhost:8081/dist/";
      /******/
      /******/ // Load entry module and return exports
      /******/return __webpack_require__(__webpack_require__.s = 0);
      /******/
    }(
    /************************************************************************/
    /******/[
    /* 0 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.Event = undefined;

      var _EventDispatcher = __webpack_require__(1);

      var _EventDispatcher2 = _interopRequireDefault(_EventDispatcher);

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      exports.default = _EventDispatcher2.default;
      exports.Event = _EventDispatcher.Event;

      /***/
    },
    /* 1 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });

      var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
        return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
      };

      var _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
          }
        }return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
        };
      }();

      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

      var hasOwnProp = function hasOwnProp(target, name) {
        return Object.prototype.hasOwnProperty.call(target, name);
      }; /**
          * Created by Oleg Galaburda on 09.02.16.
          * 
          */

      var Event = exports.Event = function () {
        function Event(type) {
          var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          _classCallCheck(this, Event);

          this.type = type;
          this.data = data;
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
        function EventDispatcher() {
          var eventPreprocessor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
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
          value: function initialize() {
            var eventPreprocessor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

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

      /***/
    }]
    /******/)
  );
});
//# sourceMappingURL=event-dispatcher.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(29)(module)))

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createTargetResource; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_getId__ = __webpack_require__(18);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
      return _defineProperty({}, __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_DATA__["a" /* default */], {
        id: _this.id,
        type: _this.type,
        poolId: _this.poolId
      });
    };

    Object.defineProperties(this, (_Object$definePropert = {}, _defineProperty(_Object$definePropert, __WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__["a" /* default */], {
      value: {
        pool: pool,
        resource: resource,
        type: type,
        id: id,
        active: true,
        poolId: getPoolId(pool)
      }
    }), _defineProperty(_Object$definePropert, __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_DATA__["a" /* default */], {
      get: this.toJSON
    }), _Object$definePropert));
  }

  _createClass(TargetResource, [{
    key: 'destroy',
    value: function destroy() {
      var internals = this[__WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__["a" /* default */]];
      var id = internals.id,
          pool = internals.pool;


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
      return Boolean(this[__WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__["a" /* default */]].active);
    }
  }, {
    key: 'resource',
    get: function get() {
      return this[__WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__["a" /* default */]].resource;
    }
  }, {
    key: 'type',
    get: function get() {
      return this[__WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__["a" /* default */]].type || _typeof(this[__WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__["a" /* default */]].resource);
    }
  }, {
    key: 'id',
    get: function get() {
      return this[__WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__["a" /* default */]].id;
    }
  }, {
    key: 'poolId',
    get: function get() {
      return this[__WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__["a" /* default */]].poolId;
    }
  }]);

  return TargetResource;
}();

var createTargetResource = function createTargetResource(pool, resource, resourceType, id) {
  return new TargetResource(pool, resource, resourceType, id || Object(__WEBPACK_IMPORTED_MODULE_2__utils_getId__["a" /* default */])());
};

/* harmony default export */ __webpack_exports__["b"] = (TargetResource);

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isResource__ = __webpack_require__(0);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };





/* harmony default export */ __webpack_exports__["a"] = (function (object) {
  if (_typeof(object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]]) === 'object') {
    return object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]].poolId;
  } else if (Object(__WEBPACK_IMPORTED_MODULE_2__isResource__["a" /* default */])(object)) {
    return object[__WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__["a" /* default */]].poolId;
  }
  return null;
});

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isResource__ = __webpack_require__(0);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };





/* harmony default export */ __webpack_exports__["a"] = (function (object) {
  // if (object instanceof TargetResource || object instanceof RequestTarget) {
  if (_typeof(object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]]) === 'object') {
    return object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]].id;
  } else if (Object(__WEBPACK_IMPORTED_MODULE_2__isResource__["a" /* default */])(object)) {
    return object[__WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__["a" /* default */]].id;
  }

  return null;
});

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export ProxyCommandNames */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ProxyCommandFields; });
/* unused harmony export createDescriptors */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__CommandDescriptor__ = __webpack_require__(4);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var ProxyCommandNames = Object.freeze({
  GET: 'get',
  SET: 'set',
  APPLY: 'apply',
  DELETE_PROPERTY: 'deleteProperty'
});

var ProxyCommandFields = Object.freeze({
  get: Symbol('proxy.commands::get'),
  set: Symbol('proxy.commands::set'),
  apply: Symbol('proxy.commands::apply'),
  deleteProperty: Symbol('proxy.commands::deleteProperty')
});

var ProxyCommandsClass = function () {
  function ProxyCommandsClass() {
    _classCallCheck(this, ProxyCommandsClass);

    this.createGETDescriptor = Object(__WEBPACK_IMPORTED_MODULE_0__CommandDescriptor__["d" /* descriptorGeneratorFactory */])(ProxyCommandNames.GET, ProxyCommandFields.get);
    this.createSETDescriptor = Object(__WEBPACK_IMPORTED_MODULE_0__CommandDescriptor__["d" /* descriptorGeneratorFactory */])(ProxyCommandNames.SET, ProxyCommandFields.set);
    this.createAPPLYDescriptor = Object(__WEBPACK_IMPORTED_MODULE_0__CommandDescriptor__["d" /* descriptorGeneratorFactory */])(ProxyCommandNames.APPLY, ProxyCommandFields.apply);

    Object.freeze(this);
  }

  _createClass(ProxyCommandsClass, [{
    key: 'list',
    get: function get() {
      return [ProxyCommandNames.GET, ProxyCommandNames.SET, ProxyCommandNames.APPLY, ProxyCommandNames.DELETE_PROPERTY];
    }
  }, {
    key: 'required',
    get: function get() {
      return [ProxyCommandNames.GET, ProxyCommandNames.SET, ProxyCommandNames.APPLY];
    }
  }]);

  return ProxyCommandsClass;
}();

var ProxyCommands = new ProxyCommandsClass();

var createDescriptors = function createDescriptors(handlers) {
  var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var isTemporary = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  var resourceType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var cacheable = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  var virtual = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  var args = [isTemporary, resourceType, cacheable, virtual];
  ProxyCommands.list.forEach(function (name) {
    var handler = handlers[name];
    var field = ProxyCommandFields[name];

    if (handler instanceof Function) {
      var descriptor = __WEBPACK_IMPORTED_MODULE_0__CommandDescriptor__["b" /* createCommandDescriptor */].apply(undefined, [name, handler, field].concat(args));
      descriptor = Object.freeze(descriptor);

      if (target instanceof Array) {
        target.push(descriptor);
      } else if (target) {
        target[field] = descriptor;
      }
    }
  });

  return target;
};

/* harmony default export */ __webpack_exports__["b"] = (ProxyCommands);

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isResource__ = __webpack_require__(0);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };





var getResourceType = function getResourceType(object) {
  if (_typeof(object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]]) === 'object') {
    return object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]].type;
  } else if (Object(__WEBPACK_IMPORTED_MODULE_2__isResource__["a" /* default */])(object)) {
    return object[__WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__["a" /* default */]].type;
  }

  return null;
};

/* harmony default export */ __webpack_exports__["a"] = (getResourceType);

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (Object.freeze({
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DESTROYED: 'destroyed'
}));

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (function (type, args, targetId) {
  var result = {
    type: type,
    cmd: args[0], // cmd,
    value: args[1], // value,
    target: targetId
  };

  // FIXME why? mprobably to make it not enumerable?.. fuck, dunno
  Object.defineProperty(result, 'args', {
    value: args
  });

  return result;
});

/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getRawResource__ = __webpack_require__(7);



/* harmony default export */ __webpack_exports__["a"] = (function (object) {
  var data = Object(__WEBPACK_IMPORTED_MODULE_1__getRawResource__["a" /* default */])(object);
  return data ? data[__WEBPACK_IMPORTED_MODULE_0__TARGET_DATA__["a" /* default */]] : null;
});

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var base = "DA/" + Date.now() + "/";
var index = 0;
/* harmony default export */ __webpack_exports__["a"] = (function () {
  return "" + base + ++index + "/" + Date.now();
});

/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return RequestTargetCommandNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RequestTargetCommandFields; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__CommandDescriptor__ = __webpack_require__(4);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var RequestTargetCommandNames = Object.freeze({
  DESTROY: '::destroy.resource'
});

var RequestTargetCommandFields = Object.freeze({
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
    var descriptor = new __WEBPACK_IMPORTED_MODULE_0__CommandDescriptor__["c" /* default */](RequestTargetCommandNames.DESTROY, handler, RequestTargetCommandFields.DESTROY);
    descriptor.cacheable = false;
    descriptor.virtual = true;
    Object(__WEBPACK_IMPORTED_MODULE_0__CommandDescriptor__["a" /* addDescriptorTo */])(descriptor, target);
    return Object.freeze(descriptor);
  };

  Object.freeze(this);
};

/* harmony default export */ __webpack_exports__["c"] = (new RequestTargetCommands());

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Reserved words
 */
/* harmony default export */ __webpack_exports__["a"] = (Object.freeze({
  /**
   * Contains property names that cannot be used for CommandDescriptor's
   */
  names: Object.freeze({
    // INFO Exposed Promise method, cannot be overwritten by type
    then: true,
    // INFO Exposed Promise method, cannot be overwritten by type
    catch: true
  })
}));

/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createRequestFactory; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__RequestTargetDecorator__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__RequestTarget__ = __webpack_require__(3);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




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
    this.handlers = handlers;
    this.decorator = Object(__WEBPACK_IMPORTED_MODULE_0__RequestTargetDecorator__["a" /* createRequestTargetDecorator */])(this, handlers);
  }

  _createClass(RequestFactory, [{
    key: 'create',
    value: function create(promise) {
      var request = Object(__WEBPACK_IMPORTED_MODULE_1__RequestTarget__["a" /* createRequestTarget */])(promise, this.handlers);
      if (this.handlers.available) {
        this.decorator.apply(request);
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

var createRequestFactory = function createRequestFactory(handlers, cacheImpl) {
  return new RequestFactory(handlers, cacheImpl);
};

/* harmony default export */ __webpack_exports__["b"] = (RequestFactory);

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export ResourceConverterEvents */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createResourceConverter; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_getResourcePoolId__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_getResourceId__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_isResourceConvertible__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils_getRawResource__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__request_RequestTarget__ = __webpack_require__(3);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }









var ResourceConverterEvents = Object.freeze({
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

      if (Object(__WEBPACK_IMPORTED_MODULE_4__utils_isResourceConvertible__["a" /* default */])(data)) {
        result = Object(__WEBPACK_IMPORTED_MODULE_5__utils_getRawResource__["a" /* default */])(data, this.pool);
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

      if (Object(__WEBPACK_IMPORTED_MODULE_3__utils_isResource__["a" /* default */])(data)) {
        var poolId = Object(__WEBPACK_IMPORTED_MODULE_1__utils_getResourcePoolId__["a" /* default */])(data);

        if (this.registry.isRegistered(poolId)) {
          // target object is stored in current pool
          var target = this.registry.get(poolId).get(Object(__WEBPACK_IMPORTED_MODULE_2__utils_getResourceId__["a" /* default */])(data));

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
      var _this2 = this;

      return list.map(function (item) {
        return linkConvertHandler.call(_this2, item);
      });
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
      var _this3 = this;

      return Object.getOwnPropertyNames(data).reduce(function (result, name) {
        if (Object.prototype.hasOwnProperty.call(data, name)) {
          result[name] = linkConvertHandler.call(_this3, data[name]);
        }
      }, {});
      for (var name in data) {}
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
        if (Object(__WEBPACK_IMPORTED_MODULE_4__utils_isResourceConvertible__["a" /* default */])(data)) {
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
        if (Object(__WEBPACK_IMPORTED_MODULE_3__utils_isResource__["a" /* default */])(data)) {
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
        if (Object(__WEBPACK_IMPORTED_MODULE_6__request_RequestTarget__["d" /* isPending */])(value)) {
          result.push(value);
        }
        return value;
      };

      if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && data !== null) {
        if (Object(__WEBPACK_IMPORTED_MODULE_6__request_RequestTarget__["d" /* isPending */])(data)) {
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
}(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default.a);

/**
 * @param {RequestFactory} factory
 * @param {DataAccessInterface.ResourcePoolRegistry} registry
 * @param {DataAccessInterface.ResourcePool} pool
 * @param {RequestHandlers} handlers
 * @returns {ResourceConverter}
 */


var createResourceConverter = function createResourceConverter(factory, registry, pool, handlers) {
  return new ResourceConverter(factory, registry, pool, handlers);
};

/* harmony default export */ __webpack_exports__["b"] = (ResourceConverter);

/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__IConvertible__ = __webpack_require__(8);



/* harmony default export */ __webpack_exports__["a"] = (function (data) {
  return Object(__WEBPACK_IMPORTED_MODULE_0__isResource__["a" /* default */])(data) || typeof data === 'function' || data instanceof __WEBPACK_IMPORTED_MODULE_1__IConvertible__["a" /* default */];
});

/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export ResourcePoolRegistryEvents */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createResourcePoolRegistry; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ResourcePool__ = __webpack_require__(5);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }




var ResourcePoolRegistryEvents = Object.freeze({
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

    _this.handlePoolDestroyed = function (event) {
      _this.remove(event.data);
    };

    _this[POOLS_FIELD] = {};

    // every registry should keep default pool, so you can have access from anywhere
    _this.register(__WEBPACK_IMPORTED_MODULE_1__ResourcePool__["d" /* defaultResourcePool */]);
    return _this;
  }

  _createClass(ResourcePoolRegistry, [{
    key: 'createPool',


    /**
     * Create and register ResourcePool
     * @returns {DataAccessInterface.ResourcePool} New ResourcePool instance
     */
    value: function createPool() {
      var pool = Object(__WEBPACK_IMPORTED_MODULE_1__ResourcePool__["b" /* createResourcePool */])();
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
      pool.addEventListener(__WEBPACK_IMPORTED_MODULE_1__ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, this.handlePoolDestroyed);
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
      return Object.prototype.hasOwnProperty.call(this[POOLS_FIELD], pool instanceof __WEBPACK_IMPORTED_MODULE_1__ResourcePool__["c" /* default */] ? pool.id : String(pool));
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
      pool = pool instanceof __WEBPACK_IMPORTED_MODULE_1__ResourcePool__["c" /* default */] ? pool : this.get(pool);
      if (pool) {
        pool.removeEventListener(__WEBPACK_IMPORTED_MODULE_1__ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, this.handlePoolDestroyed);
        result = delete this[POOLS_FIELD][pool.id];
      }
      if (this.hasEventListener(ResourcePoolRegistryEvents.RESOURCE_POOL_REMOVED)) {
        this.dispatchEvent(ResourcePoolRegistryEvents.RESOURCE_POOL_REMOVED, pool);
      }
      return result;
    }
  }]);

  return ResourcePoolRegistry;
}(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default.a);

var createResourcePoolRegistry = function createResourcePoolRegistry() {
  return new ResourcePoolRegistry();
};

/* harmony default export */ __webpack_exports__["b"] = (ResourcePoolRegistry);

/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__DataAccessInterface__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_Deferred__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__commands_CommandDescriptor__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__commands_Reserved__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__commands_RequestTargetCommands__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__commands_ProxyCommands__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__request_RequestTarget__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__resource_ResourcePool__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__resource_ResourcePoolRegistry__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__resource_ResourceConverter__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__utils_IConvertible__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__utils_isResourceConvertible__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__utils_getRawResource__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__utils_getResourceData__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__utils_getResourceId__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__utils_getResourcePoolId__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__utils_getResourceType__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__utils_isResource__ = __webpack_require__(0);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return __WEBPACK_IMPORTED_MODULE_0__DataAccessInterface__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "dummy", function() { return __WEBPACK_IMPORTED_MODULE_0__DataAccessInterface__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "createDeferred", function() { return __WEBPACK_IMPORTED_MODULE_1__utils_Deferred__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Deferred", function() { return __WEBPACK_IMPORTED_MODULE_1__utils_Deferred__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "CommandDescriptor", function() { return __WEBPACK_IMPORTED_MODULE_2__commands_CommandDescriptor__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Reserved", function() { return __WEBPACK_IMPORTED_MODULE_3__commands_Reserved__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "RequestTargetCommands", function() { return __WEBPACK_IMPORTED_MODULE_4__commands_RequestTargetCommands__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "ProxyCommands", function() { return __WEBPACK_IMPORTED_MODULE_5__commands_ProxyCommands__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "RequestTarget", function() { return __WEBPACK_IMPORTED_MODULE_6__request_RequestTarget__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "ResourcePool", function() { return __WEBPACK_IMPORTED_MODULE_7__resource_ResourcePool__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "ResourcePoolRegistry", function() { return __WEBPACK_IMPORTED_MODULE_8__resource_ResourcePoolRegistry__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "ResourceConverter", function() { return __WEBPACK_IMPORTED_MODULE_9__resource_ResourceConverter__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "IConvertible", function() { return __WEBPACK_IMPORTED_MODULE_10__utils_IConvertible__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "isResourceConvertible", function() { return __WEBPACK_IMPORTED_MODULE_11__utils_isResourceConvertible__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "getRawResource", function() { return __WEBPACK_IMPORTED_MODULE_12__utils_getRawResource__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "getResourceData", function() { return __WEBPACK_IMPORTED_MODULE_13__utils_getResourceData__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "getResourceId", function() { return __WEBPACK_IMPORTED_MODULE_14__utils_getResourceId__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "getResourcePoolId", function() { return __WEBPACK_IMPORTED_MODULE_15__utils_getResourcePoolId__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "getResourceType", function() { return __WEBPACK_IMPORTED_MODULE_16__utils_getResourceType__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "isResource", function() { return __WEBPACK_IMPORTED_MODULE_17__utils_isResource__["a"]; });



















/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__DataAccessInterface__["b" /* default */]);



/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return create; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return dummy; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_areProxiesAvailable__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_getResourcePoolId__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_getResourceId__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__request_RequestHandlers__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__request_RequestProxyFactory__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__request_RequestFactory__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__resource_ResourcePool__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__resource_ResourceConverter__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__resource_ResourcePoolRegistry__ = __webpack_require__(24);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @exports DataAccessInterface
 */












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

      if (proxyEnabled && !Object(__WEBPACK_IMPORTED_MODULE_0__utils_areProxiesAvailable__["a" /* default */])()) {
        throw new Error('Proxies are not available in this environment');
      }

      this.handlers = Object(__WEBPACK_IMPORTED_MODULE_4__request_RequestHandlers__["a" /* createRequestHandlers */])(proxyEnabled);
      this.resourceConverter = Object(__WEBPACK_IMPORTED_MODULE_8__resource_ResourceConverter__["a" /* createResourceConverter */])(this.factory, this.poolRegistry, this.pool, this.handlers);

      if (proxyEnabled) {
        this.factory = Object(__WEBPACK_IMPORTED_MODULE_5__request_RequestProxyFactory__["a" /* createRequestProxyFactory */])(this.handlers, this.cache);
      } else {
        this.factory = Object(__WEBPACK_IMPORTED_MODULE_6__request_RequestFactory__["a" /* createRequestFactory */])(this.handlers, this.cache);
      }

      if (!this.poolRegistry) {
        this.poolRegistry = Object(__WEBPACK_IMPORTED_MODULE_9__resource_ResourcePoolRegistry__["a" /* createResourcePoolRegistry */])();
      }

      if (this.pool) {
        this.poolRegistry.register(this.pool);
      } else if (this.pool !== undefined) {
        this.pool = this.poolRegistry.createPool();
      } else {
        this.pool = __WEBPACK_IMPORTED_MODULE_7__resource_ResourcePool__["d" /* defaultResourcePool */];
      }

      var poolDestroyedHandler = function poolDestroyedHandler() {
        _this.pool.removeEventListener(__WEBPACK_IMPORTED_MODULE_7__resource_ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, poolDestroyedHandler);
        _this.pool = _this.poolRegistry.createPool();
        _this.pool.addEventListener(__WEBPACK_IMPORTED_MODULE_7__resource_ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, poolDestroyedHandler);
      };

      this.handlers.setHandlers(descriptors);
      this.pool.addEventListener(__WEBPACK_IMPORTED_MODULE_7__resource_ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, poolDestroyedHandler);
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
      if (Object(__WEBPACK_IMPORTED_MODULE_1__utils_isResource__["a" /* default */])(resource)) {
        pool = this.poolRegistry.get(Object(__WEBPACK_IMPORTED_MODULE_2__utils_getResourcePoolId__["a" /* default */])(resource));
        return pool && pool.has(Object(__WEBPACK_IMPORTED_MODULE_3__utils_getResourceId__["a" /* default */])(resource));
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

var create = function create(handlers, proxyEnabled, poolRegistry, pool, cacheImpl) {
  return new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);
};

var dummy = function dummy(handlers, proxyEnabled, poolRegistry, pool, cacheImpl) {
  var api = new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);
  return api.parse(handlers());
};

/* harmony default export */ __webpack_exports__["b"] = (DataAccessInterface);

/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (function () {
  return typeof Proxy === 'function';
});

/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_Deferred__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_createRequestPackage__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils_getResourceData__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__RequestTarget__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__commands_RequestTargetCommands__ = __webpack_require__(19);
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
      _this.status = __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].RESOLVED;
      if (Object(__WEBPACK_IMPORTED_MODULE_4__utils_isResource__["a" /* default */])(value)) {
        _this.link = Object(__WEBPACK_IMPORTED_MODULE_5__utils_getResourceData__["a" /* default */])(value);
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
      _this.status = __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].REJECTED;
      _this.rejectQueue('Target of the call was rejected and call cannot be sent.');
      _this.deferred.reject(value);
      delete _this.deferred;
    };

    this.requestHandlers = requestHandlers;
    this.requestTarget = requestTarget;
    this.link = {};
    // INFO this should be not initialized i.e. keep it undefined, this will be checked later
    this.temporary = undefined;
    this.hadChildPromises = false;
    this.status = __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].PENDING;
    this.queue = [];
    this.children = [];
    this.deferred = Object(__WEBPACK_IMPORTED_MODULE_1__utils_Deferred__["a" /* createDeferred */])();
    this.promise = this.deferred.promise;
    promise.then(this.handlePromiseResolve).catch(this.handlePromiseReject);
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
        promise = this.applyRequest(name, pack, deferred || Object(__WEBPACK_IMPORTED_MODULE_1__utils_Deferred__["a" /* createDeferred */])(), child);
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
        case __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].PENDING:
          this.addToQueue(name, pack, deferred, child);
          break;
        case __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].REJECTED:
          promise = Promise.reject(new Error('Target object was rejected and cannot be used for calls.'));
          break;
        case __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].DESTROYED:
          promise = Promise.reject(new Error('Target object was destroyed and cannot be used for calls.'));
          break;
        case __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].RESOLVED:
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
      Object(__WEBPACK_IMPORTED_MODULE_6__RequestTarget__["c" /* getRawPromise */])(childRequestTarget).then(handleChildRequest, handleChildRequest);
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      return this.status === __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].PENDING || this.status === __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].RESOLVED;
    }
  }, {
    key: 'canBeDestroyed',
    value: function canBeDestroyed() {
      return this.status === __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].RESOLVED || this.status === __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].REJECTED;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var promise = null;
      if (this.canBeDestroyed()) {
        // INFO I should not clear children list, since they are pending and requests already sent.
        if (this.status === __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].RESOLVED) {
          promise = this.sendRequest(__WEBPACK_IMPORTED_MODULE_7__commands_RequestTargetCommands__["a" /* RequestTargetCommandFields */].DESTROY, Object(__WEBPACK_IMPORTED_MODULE_3__utils_createRequestPackage__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_7__commands_RequestTargetCommands__["b" /* RequestTargetCommandNames */].DESTROY, [null, null], this.id));
        } else {
          promise = Promise.resolve();
        }
        this.status = __WEBPACK_IMPORTED_MODULE_0__utils_TargetStatus__["a" /* default */].DESTROYED;
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
      return _defineProperty({}, __WEBPACK_IMPORTED_MODULE_2__utils_TARGET_DATA__["a" /* default */], {
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

/* harmony default export */ __webpack_exports__["a"] = (RequestTargetInternals);

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export areProxyHandlersAvailable */
/* unused harmony export RequestHandlersEvents */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createRequestHandlers; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__commands_CommandDescriptor__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_filterRequestHandlers__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_getResourceType__ = __webpack_require__(14);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }






/**
 * Key for default type for handlers that will be applied to any
 * resource that does not have type-specific handlers registered
 * @type {string}
 */
var DEFAULT_KEY = '';

var areProxyHandlersAvailable = function areProxyHandlersAvailable(handlers, throwError) {
  var result = true;
  __WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__["b" /* default */].required.forEach(function (name) {
    if (!(__WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__["a" /* ProxyCommandFields */][name] in handlers)) {
      result = false;
      if (throwError) {
        throw new Error('For Proxy interface, handler "' + name + '" should be set.');
      }
    }
  });

  return result;
};

var RequestHandlersEvents = Object.freeze({
  HANDLERS_UPDATED: 'handlersUpdated'
});

var RequestHandlers = function () {

  /**
   * @class RequestHandlers
   * @param {boolean} proxyEnabled
   * @private
   */
  function RequestHandlers() {
    var proxyEnabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

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
        areProxyHandlersAvailable(this.descriptors[DEFAULT_KEY], true);
      }
    }
  }, {
    key: 'setHandlersByType',
    value: function setHandlersByType(type, handlers) {
      var descrs = {};
      var props = [];
      Object(__WEBPACK_IMPORTED_MODULE_2__utils_filterRequestHandlers__["a" /* default */])(handlers, descrs, props);
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
  }, {
    key: 'getPropertyHandlers',
    value: function getPropertyHandlers(type) {
      var list = this.properties[type];
      if (!list) {
        type = DEFAULT_KEY;
        list = this.properties[type];
      }

      return list ? [].concat(_toConsumableArray(list)) : [];
    }
  }, {
    key: 'getPropertyNames',
    value: function getPropertyNames(type) {
      return this.getPropertyNames(type).map(function (descriptor) {
        return descriptor.name;
      });
    }
  }, {
    key: 'getHandlers',
    value: function getHandlers(type) {
      if (this.descriptors[type]) {
        return Object.assign({}, this.descriptors[type], this.descriptors[DEFAULT_KEY]);
      }

      return Object.assign({}, this.descriptors[DEFAULT_KEY]);
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
      var handler = this.getHandler(name, Object(__WEBPACK_IMPORTED_MODULE_3__utils_getResourceType__["a" /* default */])(parentRequest));
      if (handler instanceof __WEBPACK_IMPORTED_MODULE_0__commands_CommandDescriptor__["c" /* default */]) {
        // INFO result should be applied to deferred.resolve() or deferred.reject()
        handler.handler(parentRequest, data, deferred, resultRequest);
      } else {
        throw new Error('Command descriptor for "' + name + '" was not found.');
      }
    }
  }, {
    key: 'available',
    get: function get() {
      var _this3 = this;

      var nonEmptyListIndex = Object.getOwnPropertyNames(this.properties).findIndex(function (name) {
        var list = _this3.properties[name];
        return Boolean(list && list.length);
      });
      return nonEmptyListIndex >= 0;
    }
  }]);

  return RequestHandlers;
}();

/**
 * @member RequestHandlers.create
 * @param {Boolean} proxyEnabled
 * @returns {RequestHandlers}
 */


var createRequestHandlers = function createRequestHandlers(proxyEnabled) {
  return new RequestHandlers(proxyEnabled);
};

/* unused harmony default export */ var _unused_webpack_default_export = (RequestHandlers);

/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__commands_CommandDescriptor__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__commands_Reserved__ = __webpack_require__(20);



/**
 * Checks for CommandDescriptor uniqueness and reserved words usage.
 * @param {DataAccessInterface.CommandDescriptor} descriptor
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 * @private
 */
var applyDescriptor = function applyDescriptor(descriptor, descriptors, properties) {
  var name = descriptor.name;

  if (name in __WEBPACK_IMPORTED_MODULE_1__commands_Reserved__["a" /* default */].names) {
    throw new Error('Name "' + name + '" is reserved and cannot be used in descriptor.');
  }
  if (Object.prototype.hasOwnProperty.call(descriptors, name) && descriptors[name] instanceof __WEBPACK_IMPORTED_MODULE_0__commands_CommandDescriptor__["c" /* default */]) {
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
    if (value instanceof __WEBPACK_IMPORTED_MODULE_0__commands_CommandDescriptor__["c" /* default */]) {
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
      value = Object(__WEBPACK_IMPORTED_MODULE_0__commands_CommandDescriptor__["b" /* createCommandDescriptor */])(name, value);
    }
    if (value instanceof __WEBPACK_IMPORTED_MODULE_0__commands_CommandDescriptor__["c" /* default */]) {
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
/* harmony default export */ __webpack_exports__["a"] = (function (handlers, descriptors, properties) {
  if (handlers instanceof Array) {
    filterArray(handlers, descriptors, properties);
  } else {
    filterHash(handlers, descriptors, properties);
  }
});

/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export createProxyHandlers */
/* unused harmony export applyProxyWithDefaultHandlers */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createRequestProxyFactory; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__RequestFactory__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__ = __webpack_require__(13);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _this = this;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }




var EXCLUSIONS = {
  /*
   INFO arguments and caller were included because they are required function properties
   */
  arguments: true,
  caller: true,
  prototype: true
};

var toString = function toString() {
  return '[RequestTargetProxy ' + String(_this.target) + ']';
};

var createFunctionWrapper = function createFunctionWrapper(target) {
  // INFO Target must be a function so I could use Proxy.call() interceptor.
  function requestTargetProxy() {}

  requestTargetProxy.target = target;
  requestTargetProxy.toString = toString;

  return requestTargetProxy;
};

var wrapWithProxy = function wrapWithProxy(target, handlers) {
  return new Proxy(createFunctionWrapper(target), handlers);
};

var proxyGet = function proxyGet(wrapper, name) {
  var target = wrapper.target;

  if (name in target || name in EXCLUSIONS || (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'symbol') {
    return target[name];
  }
  // INFO Proxy should be already applied, so no need in additional wrapping
  return target[__WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__["a" /* ProxyCommandFields */].get](name);
};

// INFO Proxy should be already applied, so no need in additional wrapping
var proxyApply = function proxyApply(wrapper, thisValue, args) {
  return wrapper.target[__WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__["a" /* ProxyCommandFields */].apply](null, args);
};

var proxySet = function proxySet(wrapper, name, value) {
  var target = wrapper.target;


  if (name in target || name in EXCLUSIONS || (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'symbol') {
    target[name] = value;
    return value;
  }

  if (__WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__["a" /* ProxyCommandFields */].set in target) {
    target[__WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__["a" /* ProxyCommandFields */].set](name, value);
    return true;
  }

  return false;
};

var proxyHas = function proxyHas(wrapper, name) {
  return Object.prototype.hasOwnProperty.call(wrapper.target, name);
};

var proxyDeleteProperty = function proxyDeleteProperty(wrapper, name) {
  var target = wrapper.target;

  if (__WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__["a" /* ProxyCommandFields */].deleteProperty in target) {
    target[__WEBPACK_IMPORTED_MODULE_1__commands_ProxyCommands__["a" /* ProxyCommandFields */].deleteProperty](name);
    return true;
  }

  return false;
};

var proxyOwnKeys = function proxyOwnKeys(wrapper) {
  var target = wrapper.target;

  return [].concat(_toConsumableArray(Object.getOwnPropertyNames(target)), _toConsumableArray(Object.getOwnPropertyNames(EXCLUSIONS)));
};

var proxyEnumerate = function proxyEnumerate(wrapper) {
  var target = wrapper.target;

  return [].concat(_toConsumableArray(Object.getOwnPropertyNames(target)), _toConsumableArray(Object.getOwnPropertyNames(EXCLUSIONS)))[Symbol.iterator]();
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
var createProxyHandlers = function createProxyHandlers() {
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

    var _this2 = _possibleConstructorReturn(this, (RequestProxyFactory.__proto__ || Object.getPrototypeOf(RequestProxyFactory)).call(this, null, null, true));

    _this2.handlers = handlers;
    _this2.factory = Object(__WEBPACK_IMPORTED_MODULE_0__RequestFactory__["a" /* createRequestFactory */])(handlers, cacheImpl);
    _this2.factory.decorator.setFactory(_this2);
    return _this2;
  }

  _createClass(RequestProxyFactory, [{
    key: 'create',
    value: function create(promise) {
      var instance = this.factory.create(promise);

      if (this.handlers.available) {
        return wrapWithProxy(instance, PROXY_HANDLERS);
      }

      return instance;
    }
  }, {
    key: 'getCached',
    value: function getCached(name, pack) {
      return this.factory.getCached(name, pack);
    }
  }, {
    key: 'createCached',
    value: function createCached(promise, name, pack) {
      var instance = this.factory.createCached(promise, name, pack);

      if (this.handlers.available) {
        return wrapWithProxy(instance, PROXY_HANDLERS);
      }

      return instance;
    }
  }]);

  return RequestProxyFactory;
}(__WEBPACK_IMPORTED_MODULE_0__RequestFactory__["b" /* default */]);

var applyProxyWithDefaultHandlers = function applyProxyWithDefaultHandlers(target) {
  return wrapWithProxy(target, PROXY_HANDLERS);
};

var createRequestProxyFactory = function createRequestProxyFactory(handlers, cacheImpl) {
  return new RequestProxyFactory(handlers, cacheImpl);
};

/* unused harmony default export */ var _unused_webpack_default_export = (RequestProxyFactory);

/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createRequestTargetDecorator; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__commands_CommandHandlerFactory__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_getResourceType__ = __webpack_require__(14);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
    this.members = new __WEBPACK_IMPORTED_MODULE_0__commands_CommandHandlerFactory__["a" /* default */](factory);
  }

  _createClass(RequestTargetDecorator, [{
    key: 'apply',
    value: function apply(request) {
      var _this = this;

      if (!this.handlers.available) {
        return request;
      }

      var descriptors = this.handlers.getPropertyHandlers(Object(__WEBPACK_IMPORTED_MODULE_1__utils_getResourceType__["a" /* default */])(request));
      descriptors.reduce(function (request, descriptor) {
        request[descriptor.name] = _this.members.get(descriptor);
        return request;
      }, request);

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

var createRequestTargetDecorator = function createRequestTargetDecorator(factory, handlers) {
  return new RequestTargetDecorator(factory, handlers);
};

/* unused harmony default export */ var _unused_webpack_default_export = (RequestTargetDecorator);

/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_Deferred__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_createRequestPackage__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__request_RequestTarget__ = __webpack_require__(3);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }






var createCommandHandlerFor = function createCommandHandlerFor(factoryWrapper, propertyName, commandType, isTemporary, cacheable) {
  var factory = factoryWrapper.factory,
      checkState = factoryWrapper.checkState,
      getChildRequest = factoryWrapper.getChildRequest;


  function commandHandler(command, value) {
    var result = void 0;
    var promise = void 0;
    if (this[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]]) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var pack = Object(__WEBPACK_IMPORTED_MODULE_2__utils_createRequestPackage__["a" /* default */])(commandType, [command, value].concat(args), this[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].id);
      // FIXME Explicitly pass scope
      var request = getChildRequest(propertyName, pack, cacheable);
      result = request.child;
      if (request.deferred) {
        promise = this[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]].sendRequest(propertyName, pack, request.deferred, result);
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
        deferred = Object(__WEBPACK_IMPORTED_MODULE_1__utils_Deferred__["a" /* createDeferred */])();
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
          Object(__WEBPACK_IMPORTED_MODULE_3__request_RequestTarget__["e" /* setTemporary */])(childRequest, isTemporary);
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

/* harmony default export */ __webpack_exports__["a"] = (CommandHandlerFactory);

/***/ })
/******/ ]);
});
//# sourceMappingURL=deferred-data-access.js.map