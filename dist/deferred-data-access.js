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
/******/ 	return __webpack_require__(__webpack_require__.s = 28);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__request_Target__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__resource_Resource__ = __webpack_require__(12);


/* in case of circular dependency make empty base classes
   for both Target and Resource and check for them:

   Target will have:
s    class Target extends TargetBase {

   this function will have:
    object instanceof TargetBase
 */



/* harmony default export */ __webpack_exports__["a"] = (function (object) {
  if (!object) return false;

  if (object instanceof __WEBPACK_IMPORTED_MODULE_3__resource_Resource__["b" /* default */]
  // this case for RAW resources passed via JSON conversion,
  // look like {'resource::data': {$id: '1111', $poolId: '22222'}}
  || object[__WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__["a" /* default */]] // (object[TARGET_DATA] && typeof object[TARGET_DATA] === 'object')
  ) {
      return true;
    } else if (object instanceof __WEBPACK_IMPORTED_MODULE_2__request_Target__["b" /* default */] || object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]] // (object[TARGET_INTERNALS] && typeof object[TARGET_INTERNALS] === 'object')
  ) {
      // now all targets have internals in them, so we have to check if id and poolId are valid
      // to treat target as resource. In case of Proxy enabled instanceof will be Function,
      // so we have to check for internals.
      return object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]].isResource();
    }

  return false;
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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__ = __webpack_require__(1);
/**
 * Created by Oleg Galaburda on 16.11.17.
 */



/* harmony default export */ __webpack_exports__["a"] = (function (target) {
  return target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]];
});

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export DEFAULT_IS_TEMPORARY */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return createDescriptor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return addDescriptorTo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return descriptorGeneratorFactory; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_isResource__ = __webpack_require__(0);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



// It will make all resources temporary and user must explicitly set resource permanent
var DEFAULT_IS_TEMPORARY = function DEFAULT_IS_TEMPORARY(parent, child) {
  return Object(__WEBPACK_IMPORTED_MODULE_0__utils_isResource__["a" /* default */])(child);
};

var Descriptor =
// FIXME type > command; name > propertyName
function Descriptor(command, handler) {
  var propertyName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  _classCallCheck(this, Descriptor);

  this.propertyName = propertyName !== undefined ? propertyName : command;
  this.command = command;
  this.handler = handler;
  /**
   * @type {function(): boolean}
   */
  this.isTemporary = DEFAULT_IS_TEMPORARY;
  this.cacheable = true;
  // FIXME no need to pass virtual, check for propertyName is null -- its virtual then
  this.virtual = false;
  this.resourceType = null;
};

var createDescriptor = function createDescriptor(command, handler, propertyName) {
  var isTemporary = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULT_IS_TEMPORARY;
  var resourceType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var cacheable = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  var virtual = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

  var descriptor = new Descriptor(command, handler, propertyName);
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
    target[descriptor.propertyName] = descriptor;
  }
};

var descriptorGeneratorFactory = function descriptorGeneratorFactory(command, propertyName) {
  return function (handler, target) {
    var isTemporary = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_IS_TEMPORARY;
    var resourceType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var cacheable = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
    var virtual = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    var descriptor = createDescriptor(command, handler, propertyName, isTemporary, resourceType, cacheable, virtual);
    addDescriptorTo(descriptor, target);
    return Object.freeze(descriptor);
  };
};

/* harmony default export */ __webpack_exports__["c"] = (Descriptor);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ((function (hasOwnProperty) {
  return function (target, property) {
    return hasOwnProperty.call(target, property);
  };
})(Object.prototype.hasOwnProperty));

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createRequestTarget; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__target_Internals__ = __webpack_require__(31);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




/**
 * The object that will be available on other side
 * @class DataAccessInterface.RequestTarget
 * @param _promise {Promise}
 * @param _requestHandlers {Handlers}
 */

var Target = function () {
  function Target(promise, requestHandlers) {
    _classCallCheck(this, Target);

    this[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]] = new __WEBPACK_IMPORTED_MODULE_1__target_Internals__["a" /* default */](this, promise, requestHandlers);
  }

  _createClass(Target, [{
    key: 'then',
    value: function then() {
      var _TARGET_INTERNALS;

      return (_TARGET_INTERNALS = this[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]]).then.apply(_TARGET_INTERNALS, arguments);
    }
  }, {
    key: 'catch',
    value: function _catch() {
      var _TARGET_INTERNALS2;

      return (_TARGET_INTERNALS2 = this[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]]).catch.apply(_TARGET_INTERNALS2, arguments);
    }
  }]);

  return Target;
}();

var createRequestTarget = function createRequestTarget(promise, requestHandlers) {
  return new Target(promise, requestHandlers);
};

/* harmony default export */ __webpack_exports__["b"] = (Target);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ResourcePoolEvents; });
/* unused harmony export MAP_FIELD */
/* unused harmony export isValidTarget */
/* unused harmony export setValidTargets */
/* unused harmony export getDefaultValidTargets */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return defaultResourcePool; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return createResourcePool; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_getId__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Resource__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__request_target_isRequest__ = __webpack_require__(45);
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
  return !Object(__WEBPACK_IMPORTED_MODULE_2__utils_isResource__["a" /* default */])(target) && !Object(__WEBPACK_IMPORTED_MODULE_4__request_target_isRequest__["a" /* default */])(target) && Boolean(validTargets[typeof target === 'undefined' ? 'undefined' : _typeof(target)]);
};

var setValidTargets = function setValidTargets(list) {
  validTargets = list.reduce(function (validTargets, target) {
    validTargets[target] = true;

    return validTargets;
  }, {});
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
    value: function set(value) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var map = this[MAP_FIELD];
      var resource = null;
      if (isValidTarget(value)) {
        if (map.has(value)) {
          resource = map.get(value);
        } else {
          resource = Object(__WEBPACK_IMPORTED_MODULE_3__Resource__["a" /* createResource */])(this, value, type || (typeof value === 'undefined' ? 'undefined' : _typeof(value)));
          map.set(resource.id, resource);
          map.set(value, resource);
          if (this.hasEventListener(ResourcePoolEvents.RESOURCE_ADDED)) {
            this.dispatchEvent(ResourcePoolEvents.RESOURCE_ADDED, resource);
          }
        }
      }

      return resource;
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
    value: function remove(value) {
      var map = this[MAP_FIELD];
      var resource = map.get(value);
      if (resource) {
        map.delete(resource.id);
        map.delete(resource.value);
        if (this.hasEventListener(ResourcePoolEvents.RESOURCE_REMOVED)) {
          this.dispatchEvent(ResourcePoolEvents.RESOURCE_REMOVED, resource);
        }
        resource.destroy();
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      var map = this[MAP_FIELD];
      if (this.hasEventListener(ResourcePoolEvents.POOL_CLEAR)) {
        this.dispatchEvent(ResourcePoolEvents.POOL_CLEAR, this);
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = map[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _ref = _step.value;

          var _ref2 = _slicedToArray(_ref, 2);

          var key = _ref2[0];
          var resource = _ref2[1];

          if (typeof key === 'string' && key === resource.id) {
            resource.destroy();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      map.clear();

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

ResourcePool.events = ResourcePoolEvents;

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
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (function (message) {
  return Promise.reject(new Error(message));
});

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (Object.freeze({
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DESTROYED: 'destroyed'
}));

/***/ }),
/* 10 */
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
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getInternals__ = __webpack_require__(3);
/**
 * Created by Oleg Galaburda on 16.11.17.
 */



/* harmony default export */ __webpack_exports__["a"] = (function (target) {
  var internals = Object(__WEBPACK_IMPORTED_MODULE_0__getInternals__["a" /* default */])(target);
  return internals ? internals.toJSON() : undefined;
});

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createResource; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__request_target_getInternals__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_getId__ = __webpack_require__(13);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }






var getPoolId = function getPoolId(pool) {
  return pool ? pool.id : null;
};

/**
 * @exports Resource
 */

var Resource = function () {
  function Resource(pool, value, type, id) {
    var _this = this,
        _Object$definePropert;

    _classCallCheck(this, Resource);

    this.toJSON = function () {
      return _defineProperty({}, __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_DATA__["a" /* default */], {
        $id: _this.id,
        $type: _this.type,
        $poolId: _this.poolId
      });
    };

    Object.defineProperties(this, (_Object$definePropert = {}, _defineProperty(_Object$definePropert, __WEBPACK_IMPORTED_MODULE_1__utils_TARGET_INTERNALS__["a" /* default */], {
      value: {
        pool: pool,
        value: value,
        type: type,
        id: id,
        active: true,
        poolId: getPoolId(pool)
      }
    }), _defineProperty(_Object$definePropert, __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_DATA__["a" /* default */], {
      get: this.toJSON
    }), _Object$definePropert));
  }

  _createClass(Resource, [{
    key: 'destroy',
    value: function destroy() {
      var internals = Object(__WEBPACK_IMPORTED_MODULE_2__request_target_getInternals__["a" /* default */])(this);
      var id = internals.id,
          pool = internals.pool;


      if (!internals.active) {
        return;
      }

      internals.active = false;
      pool.remove(id);

      Object.keys(internals).map(function (name) {
        return delete internals[name];
      });
    }
  }, {
    key: 'active',
    get: function get() {
      return Boolean(Object(__WEBPACK_IMPORTED_MODULE_2__request_target_getInternals__["a" /* default */])(this).active);
    }
  }, {
    key: 'value',
    get: function get() {
      return Object(__WEBPACK_IMPORTED_MODULE_2__request_target_getInternals__["a" /* default */])(this).value;
    }
  }, {
    key: 'type',
    get: function get() {
      return Object(__WEBPACK_IMPORTED_MODULE_2__request_target_getInternals__["a" /* default */])(this).type || _typeof(Object(__WEBPACK_IMPORTED_MODULE_2__request_target_getInternals__["a" /* default */])(this).value);
    }
  }, {
    key: 'id',
    get: function get() {
      return Object(__WEBPACK_IMPORTED_MODULE_2__request_target_getInternals__["a" /* default */])(this).id;
    }
  }, {
    key: 'poolId',
    get: function get() {
      return Object(__WEBPACK_IMPORTED_MODULE_2__request_target_getInternals__["a" /* default */])(this).poolId;
    }
  }]);

  return Resource;
}();

var createResource = function createResource(pool, value, resourceType) {
  var id = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  return new Resource(pool, value, resourceType, id || Object(__WEBPACK_IMPORTED_MODULE_3__utils_getId__["a" /* default */])());
};

/* harmony default export */ __webpack_exports__["b"] = (Resource);

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var base = "DA/" + Date.now() + "/";
var index = 0;
/* harmony default export */ __webpack_exports__["a"] = (function () {
  return "" + base + ++index + "/" + Date.now();
});

/***/ }),
/* 14 */
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
    return object[__WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__["a" /* default */]].$poolId;
  }
  return null;
});

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isResource__ = __webpack_require__(0);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };





/* harmony default export */ __webpack_exports__["a"] = (function (object) {
  // if (object instanceof Resource || object instanceof Target) {
  if (_typeof(object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]]) === 'object') {
    return object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]].id;
  } else if (Object(__WEBPACK_IMPORTED_MODULE_2__isResource__["a" /* default */])(object)) {
    return object[__WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__["a" /* default */]].$id;
  }

  return null;
});

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export ProxyCommandNames */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ProxyCommandFields; });
/* unused harmony export createDescriptors */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Descriptor__ = __webpack_require__(4);
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

    this.names = ProxyCommandNames;
    this.fields = ProxyCommandFields;
    this.createGETDescriptor = Object(__WEBPACK_IMPORTED_MODULE_0__Descriptor__["d" /* descriptorGeneratorFactory */])(ProxyCommandNames.GET, ProxyCommandFields.get);
    this.createSETDescriptor = Object(__WEBPACK_IMPORTED_MODULE_0__Descriptor__["d" /* descriptorGeneratorFactory */])(ProxyCommandNames.SET, ProxyCommandFields.set);
    this.createAPPLYDescriptor = Object(__WEBPACK_IMPORTED_MODULE_0__Descriptor__["d" /* descriptorGeneratorFactory */])(ProxyCommandNames.APPLY, ProxyCommandFields.apply);

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
      var descriptor = __WEBPACK_IMPORTED_MODULE_0__Descriptor__["b" /* createDescriptor */].apply(undefined, [name, handler, field].concat(args));
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
/* 17 */
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
    return object[__WEBPACK_IMPORTED_MODULE_1__TARGET_DATA__["a" /* default */]].$type;
  }

  return null;
};

/* harmony default export */ __webpack_exports__["a"] = (getResourceType);

/***/ }),
/* 18 */
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44)(module)))

/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Interface for all resource types, these will be treated as resources automatically
 * @interface
 */
var IConvertible = function IConvertible() {
  _classCallCheck(this, IConvertible);
};

/* harmony default export */ __webpack_exports__["a"] = (IConvertible);

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__IConvertible__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__request_target_toJSON__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__resource_ResourcePool__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__resource_Resource__ = __webpack_require__(12);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };








/* harmony default export */ __webpack_exports__["a"] = (function (object, pool) {
  pool = pool || __WEBPACK_IMPORTED_MODULE_4__resource_ResourcePool__["d" /* defaultResourcePool */];

  if (object instanceof __WEBPACK_IMPORTED_MODULE_5__resource_Resource__["b" /* default */]) {
    return object.toJSON();
  } else if (_typeof(object[__WEBPACK_IMPORTED_MODULE_0__TARGET_INTERNALS__["a" /* default */]]) === 'object') {
    return Object(__WEBPACK_IMPORTED_MODULE_3__request_target_toJSON__["a" /* default */])(object);
  } else if (object instanceof __WEBPACK_IMPORTED_MODULE_1__IConvertible__["a" /* default */] || typeof object === 'function') {
    return pool.set(object).toJSON();
  } else if (Object(__WEBPACK_IMPORTED_MODULE_2__isResource__["a" /* default */])(object)) {
    return object;
  }

  return null;
});

/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * All arguments are required
 * @param command Command name, Descriptor's name
 * @param propertyName Property name, this is the name of the handler called against target object
 * @param args Arguments passed to handler
 * @param target JSON object representing resource or target, its raw value
 * @returns {{command: *, args: *, target: *}}
 */
/* harmony default export */ __webpack_exports__["a"] = (function (propertyName, command, args, target) {
  return {
    propertyName: propertyName,
    command: command,
    args: args,
    target: target
  };
});

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return RequestCommandNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RequestCommandFields; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Descriptor__ = __webpack_require__(4);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var RequestCommandNames = Object.freeze({
  DESTROY: '::destroy.resource'
});

var RequestCommandFields = Object.freeze({
  DESTROY: Symbol('::destroy.resource')
});

/**
 * Destroy is unique type that exists for every Target
 * and does not have a method on its instances. This type will
 * be send each time Target.destroy() is applied to
 * Target in stance.
 */

var RequestCommands = function RequestCommands() {
  _classCallCheck(this, RequestCommands);

  this.names = RequestCommandNames;
  this.fields = RequestCommandFields;

  this.createDESTROYDescriptor = function (handler, target) {
    var descriptor = new __WEBPACK_IMPORTED_MODULE_0__Descriptor__["c" /* default */](RequestCommandNames.DESTROY, handler, RequestCommandFields.DESTROY);
    descriptor.cacheable = false;
    descriptor.virtual = true;
    Object(__WEBPACK_IMPORTED_MODULE_0__Descriptor__["a" /* addDescriptorTo */])(descriptor, target);
    return Object.freeze(descriptor);
  };

  Object.freeze(this);
};

/* harmony default export */ __webpack_exports__["c"] = (new RequestCommands());

/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Reserved words
 */
/* harmony default export */ __webpack_exports__["a"] = (Object.freeze({
  /**
   * Contains property names that cannot be used for Descriptor's
   */
  names: Object.freeze({
    // INFO Exposed Promise method, cannot be overwritten by type
    then: true,
    // INFO Exposed Promise method, cannot be overwritten by type
    catch: true
  })
}));

/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return NO_INIT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return createRequestFactory; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Decorator__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Target__ = __webpack_require__(6);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




var NO_INIT = {};

var Factory = function () {
  /*
   function DummyCacheImpl() {
   this.get = function(name, pack) {
     };
   this.set = function(name, pack, request) {
     };
   }
   */
  function Factory(handlers) {
    var cacheImpl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, Factory);

    this.cache = cacheImpl;
    this.handlers = handlers;

    if (handlers !== NO_INIT) {
      this.decorator = Object(__WEBPACK_IMPORTED_MODULE_0__Decorator__["a" /* createDecorator */])(this, handlers);
    }
  }

  _createClass(Factory, [{
    key: 'create',
    value: function create(promise) {
      var pack = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var cacheable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var request = Object(__WEBPACK_IMPORTED_MODULE_1__Target__["a" /* createRequestTarget */])(promise, this.handlers);
      if (this.handlers.available) {
        this.decorator.apply(request);
      }

      if (this.cache && cacheable) {
        this.cache.set(pack, request);
      }

      return request;
    }
  }, {
    key: 'getCached',
    value: function getCached(pack) {
      return this.cache && this.cache.get(pack);
    }
  }]);

  return Factory;
}();

var createRequestFactory = function createRequestFactory(handlers, cacheImpl) {
  return new Factory(handlers, cacheImpl);
};

/* harmony default export */ __webpack_exports__["c"] = (Factory);

/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export ConverterEvents */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createResourceConverter; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_hasOwnProperty__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_getResourcePoolId__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_getResourceId__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils_isResourceConvertible__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__utils_getRawResource__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__request_target_isPending__ = __webpack_require__(46);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }










var ConverterEvents = Object.freeze({
  RESOURCE_CREATED: 'resourceCreated',
  RESOURCE_CONVERTED: 'resourceConverted'
});

/**
 * Resource converter contains bunch of methods to lookup for resources
 * and registering them, converting them into RAWResource or into
 * Targets, depending on their origin.
 * Before sending data, bundled resources should be registered in ResourcePool
 * and then converted to RAWResource objects.
 * After data received, its RAWResources should be converted to Targets
 * for not resolved resources or to resource target values otherwise.
 * Resource can be resolved by its `id` and `poolId`, if Converter
 * can find ResourcePool with id from poolId, it will try to get target
 * resource value and replace with it RAWResource object.
 * If ResourcePool not found, Converter assumes that resource come from
 * other origin/environment and creates Target object that can be target
 * object for commands.
 * Converter while handling data does not look deeply, so its developer
 * responsibility to convert deeply nested resource targets.
 */

var Converter = function (_EventDispatcher) {
  _inherits(Converter, _EventDispatcher);

  function Converter(factory, registry, pool) {
    var handlers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    _classCallCheck(this, Converter);

    var _this = _possibleConstructorReturn(this, (Converter.__proto__ || Object.getPrototypeOf(Converter)).call(this));

    _this.factory = factory;
    _this.pool = pool;
    _this.registry = registry;

    if (handlers) {
      handlers.setConverter(_this);
    }
    return _this;
  }

  _createClass(Converter, [{
    key: 'resourceToObject',
    value: function resourceToObject(data) {
      var result = void 0;

      if (Object(__WEBPACK_IMPORTED_MODULE_5__utils_isResourceConvertible__["a" /* default */])(data)) {
        result = Object(__WEBPACK_IMPORTED_MODULE_6__utils_getRawResource__["a" /* default */])(data, this.pool);
      } else if (typeof data.toJSON === 'function') {
        result = data.toJSON();
      } else {
        return data;
      }

      if (this.hasEventListener(ConverterEvents.RESOURCE_CONVERTED)) {
        this.dispatchEvent(ConverterEvents.RESOURCE_CONVERTED, {
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

      if (Object(__WEBPACK_IMPORTED_MODULE_4__utils_isResource__["a" /* default */])(data)) {
        var poolId = Object(__WEBPACK_IMPORTED_MODULE_2__utils_getResourcePoolId__["a" /* default */])(data);

        if (this.registry.isRegistered(poolId)) {
          // target object is stored in current pool
          var target = this.registry.get(poolId).get(Object(__WEBPACK_IMPORTED_MODULE_3__utils_getResourceId__["a" /* default */])(data));

          if (target) {
            result = target.value;
          }
        } else {
          // target object has another origin, should be wrapped
          result = this.factory.create(Promise.resolve(data));
        }
      }

      if (result !== data && this.hasEventListener(ConverterEvents.RESOURCE_CREATED)) {
        this.dispatchEvent(ConverterEvents.RESOURCE_CREATED, {
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
        if (Object(__WEBPACK_IMPORTED_MODULE_1__utils_hasOwnProperty__["a" /* default */])(data, name)) {
          result[name] = linkConvertHandler.call(_this3, data[name]);
        }

        return result;
      }, {});
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
        if (Object(__WEBPACK_IMPORTED_MODULE_5__utils_isResourceConvertible__["a" /* default */])(data)) {
          // if data is Target, Resource, IConvertible, Function or RAW resource data
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
        if (Object(__WEBPACK_IMPORTED_MODULE_4__utils_isResource__["a" /* default */])(data)) {
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
    // FIXME for now data is always array

  }, {
    key: 'lookupForPending',
    value: function lookupForPending(data) {
      var result = [];

      var add = function add(value) {
        if (Object(__WEBPACK_IMPORTED_MODULE_7__request_target_isPending__["a" /* default */])(value)) {
          result.push(value);
        }
        return value;
      };

      if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && data !== null) {
        if (Object(__WEBPACK_IMPORTED_MODULE_7__request_target_isPending__["a" /* default */])(data)) {
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

  return Converter;
}(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default.a);

/**
 * @param {RequestFactory} factory
 * @param {DataAccessInterface.ResourcePoolRegistry} registry
 * @param {DataAccessInterface.ResourcePool} pool
 * @param {Handlers} handlers
 * @returns {ResourceConverter}
 */


Converter.events = ConverterEvents;
var createResourceConverter = function createResourceConverter(factory, registry, pool, handlers) {
  return new Converter(factory, registry, pool, handlers);
};

/* harmony default export */ __webpack_exports__["b"] = (Converter);

/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__IConvertible__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__request_Target__ = __webpack_require__(6);




/* harmony default export */ __webpack_exports__["a"] = (function (data) {
  return Object(__WEBPACK_IMPORTED_MODULE_0__isResource__["a" /* default */])(data) || data instanceof __WEBPACK_IMPORTED_MODULE_2__request_Target__["b" /* default */] || typeof data === 'function' || data instanceof __WEBPACK_IMPORTED_MODULE_1__IConvertible__["a" /* default */];
});

/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export PoolRegistryEvents */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createPoolRegistry; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_hasOwnProperty__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ResourcePool__ = __webpack_require__(7);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }





var PoolRegistryEvents = Object.freeze({
  RESOURCE_POOL_CREATED: 'resourcePoolCreated',
  RESOURCE_POOL_REGISTERED: 'resourcePoolRegistered',
  RESOURCE_POOL_REMOVED: 'resourcePoolRemoved'
});

var POOLS_FIELD = Symbol('resource.pool.registry::pools');

/**
 * @classdesc Collection of ResourcePool instances. Allows lookup for ResourcePool by its Id.
 * When ResourcePool is registered in PoolRegistry, it subscribes to
 * ResourcePool POOL_DESTROYED event and removes pool from registry after its destroyed.
 */

var PoolRegistry = function (_EventDispatcher) {
  _inherits(PoolRegistry, _EventDispatcher);

  function PoolRegistry() {
    _classCallCheck(this, PoolRegistry);

    var _this = _possibleConstructorReturn(this, (PoolRegistry.__proto__ || Object.getPrototypeOf(PoolRegistry)).call(this));

    _this.handlePoolDestroyed = function (event) {
      _this.remove(event.data);
    };

    _this[POOLS_FIELD] = {};

    // every registry should keep default pool, so you can have access from anywhere
    _this.register(__WEBPACK_IMPORTED_MODULE_2__ResourcePool__["d" /* defaultResourcePool */]);
    return _this;
  }

  _createClass(PoolRegistry, [{
    key: 'createPool',


    /**
     * Create and register ResourcePool
     * @returns {DataAccessInterface.ResourcePool} New ResourcePool instance
     */
    value: function createPool() {
      var pool = Object(__WEBPACK_IMPORTED_MODULE_2__ResourcePool__["b" /* createResourcePool */])();
      if (this.hasEventListener(PoolRegistryEvents.RESOURCE_POOL_CREATED)) {
        this.dispatchEvent(PoolRegistryEvents.RESOURCE_POOL_CREATED, pool);
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
      if (Object(__WEBPACK_IMPORTED_MODULE_1__utils_hasOwnProperty__["a" /* default */])(this[POOLS_FIELD], pool.id)) return;
      this[POOLS_FIELD][pool.id] = pool;
      pool.addEventListener(__WEBPACK_IMPORTED_MODULE_2__ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, this.handlePoolDestroyed);
      if (this.hasEventListener(PoolRegistryEvents.RESOURCE_POOL_REGISTERED)) {
        this.dispatchEvent(PoolRegistryEvents.RESOURCE_POOL_REGISTERED, pool);
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
      return Object(__WEBPACK_IMPORTED_MODULE_1__utils_hasOwnProperty__["a" /* default */])(this[POOLS_FIELD], pool instanceof __WEBPACK_IMPORTED_MODULE_2__ResourcePool__["c" /* default */] ? pool.id : String(pool));
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
      pool = pool instanceof __WEBPACK_IMPORTED_MODULE_2__ResourcePool__["c" /* default */] ? pool : this.get(pool);
      if (pool) {
        pool.removeEventListener(__WEBPACK_IMPORTED_MODULE_2__ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, this.handlePoolDestroyed);
        result = delete this[POOLS_FIELD][pool.id];
      }
      if (this.hasEventListener(PoolRegistryEvents.RESOURCE_POOL_REMOVED)) {
        this.dispatchEvent(PoolRegistryEvents.RESOURCE_POOL_REMOVED, pool);
      }
      return result;
    }
  }]);

  return PoolRegistry;
}(__WEBPACK_IMPORTED_MODULE_0_event_dispatcher___default.a);

PoolRegistry.events = PoolRegistryEvents;


var createPoolRegistry = function createPoolRegistry() {
  return new PoolRegistry();
};

/* harmony default export */ __webpack_exports__["b"] = (PoolRegistry);

/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__DataAccessInterface__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_Deferred__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__command_Descriptor__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__command_Reserved__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__command_internal_RequestCommands__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__command_internal_ProxyCommands__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__request_Target__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__resource_ResourcePool__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__resource_PoolRegistry__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__resource_Converter__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__utils_IConvertible__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__utils_isResourceConvertible__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__utils_getRawResource__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__utils_getResourceData__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__utils_getResourceId__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__utils_getResourcePoolId__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__utils_getResourceType__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__utils_isResource__ = __webpack_require__(0);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return __WEBPACK_IMPORTED_MODULE_0__DataAccessInterface__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "dummy", function() { return __WEBPACK_IMPORTED_MODULE_0__DataAccessInterface__["dummy"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "createDeferred", function() { return __WEBPACK_IMPORTED_MODULE_1__utils_Deferred__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Deferred", function() { return __WEBPACK_IMPORTED_MODULE_1__utils_Deferred__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Descriptor", function() { return __WEBPACK_IMPORTED_MODULE_2__command_Descriptor__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Reserved", function() { return __WEBPACK_IMPORTED_MODULE_3__command_Reserved__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "RequestCommands", function() { return __WEBPACK_IMPORTED_MODULE_4__command_internal_RequestCommands__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "ProxyCommands", function() { return __WEBPACK_IMPORTED_MODULE_5__command_internal_ProxyCommands__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Target", function() { return __WEBPACK_IMPORTED_MODULE_6__request_Target__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "ResourcePool", function() { return __WEBPACK_IMPORTED_MODULE_7__resource_ResourcePool__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "PoolRegistry", function() { return __WEBPACK_IMPORTED_MODULE_8__resource_PoolRegistry__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Converter", function() { return __WEBPACK_IMPORTED_MODULE_9__resource_Converter__["b"]; });
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
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return create; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_areProxiesAvailable__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_isResource__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_getResourcePoolId__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_getResourceId__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_createForeignResource__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__request_Handlers__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__request_ProxyFactory__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__request_Factory__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__resource_ResourcePool__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__resource_Converter__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__resource_PoolRegistry__ = __webpack_require__(27);
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
   * @param {Descriptor[]|Object.<string, Function|Descriptor>} descriptors
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

      this.handlers = Object(__WEBPACK_IMPORTED_MODULE_5__request_Handlers__["a" /* createHandlers */])(proxyEnabled);

      if (proxyEnabled) {
        this.factory = Object(__WEBPACK_IMPORTED_MODULE_6__request_ProxyFactory__["a" /* createProxyFactory */])(this.handlers, this.cache);
      } else {
        this.factory = Object(__WEBPACK_IMPORTED_MODULE_7__request_Factory__["b" /* createRequestFactory */])(this.handlers, this.cache);
      }

      if (!this.poolRegistry) {
        this.poolRegistry = Object(__WEBPACK_IMPORTED_MODULE_10__resource_PoolRegistry__["a" /* createPoolRegistry */])();
      }

      if (this.pool) {
        this.poolRegistry.register(this.pool);
      } else if (this.pool !== undefined) {
        this.pool = this.poolRegistry.createPool();
      } else {
        this.pool = __WEBPACK_IMPORTED_MODULE_8__resource_ResourcePool__["d" /* defaultResourcePool */];
      }

      this.resourceConverter = Object(__WEBPACK_IMPORTED_MODULE_9__resource_Converter__["a" /* createResourceConverter */])(this.factory, this.poolRegistry, this.pool, this.handlers);

      var poolDestroyedHandler = function poolDestroyedHandler() {
        _this.pool.removeEventListener(__WEBPACK_IMPORTED_MODULE_8__resource_ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, poolDestroyedHandler);
        _this.pool = _this.poolRegistry.createPool();
        _this.pool.addEventListener(__WEBPACK_IMPORTED_MODULE_8__resource_ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, poolDestroyedHandler);
      };

      this.handlers.setCommands(descriptors);
      this.pool.addEventListener(__WEBPACK_IMPORTED_MODULE_8__resource_ResourcePool__["a" /* ResourcePoolEvents */].POOL_DESTROYED, poolDestroyedHandler);
    }
  }, {
    key: 'send',
    value: function send(command, args) {
      var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      return;
    }
  }, {
    key: 'parse',
    value: function parse(data) {
      return this.resourceConverter.parse(data);
    }
  }, {
    key: 'dummy',
    value: function dummy() {
      return this.parse(Object(__WEBPACK_IMPORTED_MODULE_4__utils_createForeignResource__["a" /* default */])());
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

var create = function create(handlers) {
  var proxyEnabled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var poolRegistry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var pool = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var cacheImpl = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  return new DataAccessInterface(handlers, proxyEnabled, poolRegistry, pool, cacheImpl);
};

/* harmony default export */ __webpack_exports__["b"] = (DataAccessInterface);

/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = (function () {
  return typeof Proxy === 'function';
});

/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_reject__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_createRequestPackage__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__command_internal_RequestCommands__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__SubTargets__ = __webpack_require__(32);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }








var Internals = function (_SubTargets) {
  _inherits(Internals, _SubTargets);

  function Internals(target, promise, handlers) {
    _classCallCheck(this, Internals);

    var _this = _possibleConstructorReturn(this, (Internals.__proto__ || Object.getPrototypeOf(Internals)).call(this));

    _this.handlePromiseResolve = function (value) {
      var result = { target: _this.target, value: value };
      _this.data = value;
      _this.status = __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].RESOLVED;
      if (_this.isResource()) {
        /*
         INFO Sending "this" as result of resolve() handler, causes infinite
         loop of this.then(), so I've used wrapper object
        */
        result.value = _this.target;
      }

      _this.parentResolved();

      // FIXME isTemporary() was not called yet, as solution can move destruction out
      if (_this.temporary) {
        _this.destroy();
      }

      return result;
    };

    _this.handlePromiseReject = function (value) {
      _this.status = __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].REJECTED;
      _this.parentRejected('Target of the call was rejected and call cannot be sent.');
      return Promise.reject(value);
    };

    _this.handlers = handlers;
    _this.target = target;
    // INFO this should be not initialized i.e. keep it undefined, this will be checked later
    _this.data = undefined;
    _this.temporary = undefined;
    _this.hadChildPromises = false;
    _this.status = __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].PENDING;
    _this.promise = promise.then(_this.handlePromiseResolve).catch(_this.handlePromiseReject);
    _this.setParent(_this);
    return _this;
  }

  _createClass(Internals, [{
    key: 'isResource',
    value: function isResource() {
      if (_typeof(this.data) === 'object' && this.data[__WEBPACK_IMPORTED_MODULE_2__utils_TARGET_DATA__["a" /* default */]]) {
        var data = this.data[__WEBPACK_IMPORTED_MODULE_2__utils_TARGET_DATA__["a" /* default */]];
        return Boolean(data.$poolId && data.$id);
      }

      return false;
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      return this.status === __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].PENDING || this.status === __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].RESOLVED;
    }
  }, {
    key: 'canBeDestroyed',
    value: function canBeDestroyed() {
      return this.status === __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].RESOLVED || this.status === __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].REJECTED;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var promise = null;
      if (this.canBeDestroyed()) {
        // INFO I should not clear children list, since they are pending and requests already sent.
        if (this.status === __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].RESOLVED) {
          promise = this.send(__WEBPACK_IMPORTED_MODULE_4__command_internal_RequestCommands__["a" /* RequestCommandFields */].DESTROY, Object(__WEBPACK_IMPORTED_MODULE_3__utils_createRequestPackage__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_4__command_internal_RequestCommands__["b" /* RequestCommandNames */].DESTROY, [], this.toJSON()));
        } else {
          promise = Promise.resolve();
        }
        this.status = __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].DESTROYED;
      } else {
        promise = Object(__WEBPACK_IMPORTED_MODULE_0__utils_reject__["a" /* default */])('Invalid or already destroyed target.');
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
      return this.data;
    }
  }, {
    key: 'poolId',
    get: function get() {
      return this.isResource() ? this.data[__WEBPACK_IMPORTED_MODULE_2__utils_TARGET_DATA__["a" /* default */]].$poolId : null;
    }
  }, {
    key: 'type',
    get: function get() {
      return this.isResource() ? this.data[__WEBPACK_IMPORTED_MODULE_2__utils_TARGET_DATA__["a" /* default */]].$type : null;
    }
  }, {
    key: 'id',
    get: function get() {
      return this.isResource() ? this.data[__WEBPACK_IMPORTED_MODULE_2__utils_TARGET_DATA__["a" /* default */]].$id : null;
    }
  }]);

  return Internals;
}(__WEBPACK_IMPORTED_MODULE_5__SubTargets__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (Internals);

/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_reject__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_Deferred__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_TargetStatus__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Queue__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__Children__ = __webpack_require__(34);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }







var SubTargets = function (_Children) {
  _inherits(SubTargets, _Children);

  function SubTargets() {
    var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, SubTargets);

    var _this = _possibleConstructorReturn(this, (SubTargets.__proto__ || Object.getPrototypeOf(SubTargets)).call(this, children));

    _this.handleSubRequest = function (pack, child) {
      var _this$parent = _this.parent,
          handlers = _this$parent.handlers,
          target = _this$parent.target;

      return handlers.handle(target, pack, child);
    };

    _this.queue = null;
    _this.setParent(parent);
    return _this;
  }

  _createClass(SubTargets, [{
    key: 'setParent',
    value: function setParent(parent) {
      this.parent = parent;
    }
  }, {
    key: 'parentResolved',
    value: function parentResolved() {
      if (this.hasQueue()) {
        this.queue.send(this.parent, this.handleSubRequest);
        this.queue = null;
      }
    }
  }, {
    key: 'parentRejected',
    value: function parentRejected() {
      var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      this.queue.reject(new Error(message || 'This request was rejected before sending.'));
      this.queue = null;
    }
  }, {
    key: 'hasQueue',
    value: function hasQueue() {
      return Boolean(this.queue && this.queue.length);
    }
  }, {
    key: 'send',
    value: function send(pack) {
      var child = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var propertyName = pack.propertyName;
      var handlers = this.parent.handlers;

      var promise = void 0;

      if (!handlers.hasCommand(propertyName)) {
        return Object(__WEBPACK_IMPORTED_MODULE_0__utils_reject__["a" /* default */])('Request handler for "' + propertyName + '" is not registered.');
      }

      promise = this.handleSend(pack, child);

      if (child) {
        promise = this.register(child);
      }

      return promise;
    }
  }, {
    key: 'handleSend',
    value: function handleSend(pack) {
      var child = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var status = this.parent.status;


      switch (status) {
        case __WEBPACK_IMPORTED_MODULE_2__utils_TargetStatus__["a" /* default */].PENDING:
          if (!this.queue) {
            this.queue = Object(__WEBPACK_IMPORTED_MODULE_3__Queue__["a" /* createQueue */])();
          }

          return this.queue.add(pack, child);
        case __WEBPACK_IMPORTED_MODULE_2__utils_TargetStatus__["a" /* default */].REJECTED:
          return Object(__WEBPACK_IMPORTED_MODULE_0__utils_reject__["a" /* default */])('Target object was rejected and cannot be used for calls.');
        case __WEBPACK_IMPORTED_MODULE_2__utils_TargetStatus__["a" /* default */].DESTROYED:
          return Object(__WEBPACK_IMPORTED_MODULE_0__utils_reject__["a" /* default */])('Target object was destroyed and cannot be used for calls.');
        case __WEBPACK_IMPORTED_MODULE_2__utils_TargetStatus__["a" /* default */].RESOLVED:
          return this.handleSubRequest(pack, child);
        default:
          return Object(__WEBPACK_IMPORTED_MODULE_0__utils_reject__["a" /* default */])('Target object is in unknown status "' + status + '".');
      }
    }
  }]);

  return SubTargets;
}(__WEBPACK_IMPORTED_MODULE_4__Children__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (SubTargets);

/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createQueue; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_Deferred__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__toJSON__ = __webpack_require__(11);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




var Queue = function () {
  function Queue() {
    var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, Queue);

    this.list = list;
  }

  _createClass(Queue, [{
    key: 'add',
    value: function add(pack, child) {
      var deferred = Object(__WEBPACK_IMPORTED_MODULE_0__utils_Deferred__["a" /* createDeferred */])();
      this.list.push({
        pack: pack,
        deferred: deferred,
        child: child
      });

      return deferred.promise;
    }
  }, {
    key: 'getList',
    value: function getList() {
      return [].concat(_toConsumableArray(this.list));
    }
  }, {
    key: 'getCommands',
    value: function getCommands() {
      // return this.list.map(([name, pack]) => pack.type);
      return this.list.map(function (_ref) {
        var propertyName = _ref.pack.propertyName;
        return propertyName;
      });
    }
  }, {
    key: 'send',
    value: function send(target, callback) {
      // target reset is needed because, when request was made, target probably was in
      // pending mode and may be didn't have proper data
      var targetJSON = Object(__WEBPACK_IMPORTED_MODULE_1__toJSON__["a" /* default */])(target);
      this.list.forEach(function (_ref2) {
        var pack = _ref2.pack,
            deferred = _ref2.deferred,
            child = _ref2.child;

        pack.target = targetJSON;
        deferred.resolve(callback(pack, child));
      });
      this.list = [];
    }
  }, {
    key: 'reject',
    value: function reject(message) {
      var error = new Error(message || 'This request was rejected before sending.');
      this.list.forEach(function (_ref3) {
        var deferred = _ref3.deferred;
        return deferred.reject(error);
      });
      this.list = [];
    }
  }, {
    key: 'length',
    get: function get() {
      return this.list.length;
    }
  }]);

  return Queue;
}();

var createQueue = function createQueue() {
  var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return new Queue(list);
};

/* unused harmony default export */ var _unused_webpack_default_export = (Queue);

/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getRawPromise__ = __webpack_require__(35);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var Children = function () {
  function Children() {
    var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, Children);

    this.list = list;
  }

  _createClass(Children, [{
    key: 'register',
    value: function register(child) {
      var _this = this;

      var handler = function handler() {
        var index = _this.list.indexOf(child);
        if (index >= 0) {
          _this.list.splice(index, 1);
        }
      };

      this.list.push(child);
      // getRawPromise() is needed to capture promise resolution directly,
      // otherwise this .then() call will be counted in child.hadChildPromises.
      return Object(__WEBPACK_IMPORTED_MODULE_0__getRawPromise__["a" /* default */])(child).then(handler, handler);
    }
  }, {
    key: 'getList',
    value: function getList() {
      return [].concat(_toConsumableArray(this.list));
    }
  }, {
    key: 'contains',
    value: function contains(item) {
      return this.list.indexOf(item) >= 0;
    }
  }, {
    key: 'length',
    get: function get() {
      return this.list.length;
    }
  }, {
    key: 'lastItem',
    get: function get() {
      var length = this.list.length;

      return length ? this.list[length - 1] : null;
    }
  }]);

  return Children;
}();

/* harmony default export */ __webpack_exports__["a"] = (Children);

/***/ }),
/* 35 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getInternals__ = __webpack_require__(3);
/**
 * Created by Oleg Galaburda on 16.11.17.
 */



/* harmony default export */ __webpack_exports__["a"] = (function (target) {
  var internals = Object(__WEBPACK_IMPORTED_MODULE_0__getInternals__["a" /* default */])(target);
  return internals ? internals.promise : undefined;
});

/***/ }),
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getId__ = __webpack_require__(13);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };




/* harmony default export */ __webpack_exports__["a"] = (function () {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var resource = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  resource[__WEBPACK_IMPORTED_MODULE_0__TARGET_DATA__["a" /* default */]] = {
    $id: 'foreign-id-' + Object(__WEBPACK_IMPORTED_MODULE_1__getId__["a" /* default */])(),
    $type: type || (typeof resource === 'undefined' ? 'undefined' : _typeof(resource)),
    $poolId: 'foreign-poolId-' + Object(__WEBPACK_IMPORTED_MODULE_1__getId__["a" /* default */])()
  };

  return resource;
});

/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export areProxyHandlersAvailable */
/* unused harmony export HandlersEvents */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createHandlers; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__command_Descriptor__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__command_internal_ProxyCommands__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_hasOwnProperty__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_filterRequestHandlers__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_getResourceType__ = __webpack_require__(17);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }







/**
 * Key for default type for handlers that will be applied to any
 * resource that does not have type-specific handlers registered
 * @type {string}
 */
var DEFAULT_KEY = '';

var areProxyHandlersAvailable = function areProxyHandlersAvailable(handlers) {
  var throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var result = true;
  __WEBPACK_IMPORTED_MODULE_1__command_internal_ProxyCommands__["b" /* default */].required.forEach(function (name) {
    if (!(__WEBPACK_IMPORTED_MODULE_1__command_internal_ProxyCommands__["a" /* ProxyCommandFields */][name] in handlers)) {
      result = false;
      if (throwError) {
        throw new Error('For Proxy interface, handler "' + name + '" should be set.');
      }
    }
  });

  return result;
};

var HandlersEvents = Object.freeze({
  HANDLERS_UPDATED: 'handlersUpdated'
});

var Handlers = function () {
  function Handlers() {
    var proxyEnabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    _classCallCheck(this, Handlers);

    // named collection of Descriptor lists that may be applied
    this.properties = _defineProperty({}, DEFAULT_KEY, []);
    this.descriptors = _defineProperty({}, DEFAULT_KEY, []);
    this.proxyEnabled = Boolean(proxyEnabled);
    this.converter = null;
  }

  _createClass(Handlers, [{
    key: 'setConverter',
    value: function setConverter(converter) {
      this.converter = converter;
    }
  }, {
    key: 'setCommands',
    value: function setCommands(handlers) {
      var _this = this;

      this.setCommandsByType(DEFAULT_KEY, handlers);

      Object.keys(handlers).forEach(function (name) {
        var handler = handlers[name];
        if (handler && (handler.constructor === Object || handler instanceof Array)) {
          _this.setCommandsByType(name, handler);
        }
      });

      if (this.proxyEnabled) {
        areProxyHandlersAvailable(this.descriptors[DEFAULT_KEY], true);
      }
    }
  }, {
    key: 'setCommandsByType',
    value: function setCommandsByType(type, handlers) {
      var descrs = {};
      var props = [];
      Object(__WEBPACK_IMPORTED_MODULE_3__utils_filterRequestHandlers__["a" /* default */])(handlers, descrs, props);
      this.descriptors[type] = descrs;
      this.properties[type] = props;
    }

    // FIXME Not quite obvious that it checks against property name, not command name

  }, {
    key: 'hasCommand',
    value: function hasCommand(propertyName) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_KEY;

      return type && this.descriptors[type] && Object(__WEBPACK_IMPORTED_MODULE_2__utils_hasOwnProperty__["a" /* default */])(this.descriptors[type], propertyName) || this.descriptors[DEFAULT_KEY] && Object(__WEBPACK_IMPORTED_MODULE_2__utils_hasOwnProperty__["a" /* default */])(this.descriptors[DEFAULT_KEY], propertyName);
    }
  }, {
    key: 'getPropertyCommands',
    value: function getPropertyCommands() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var list = this.properties[type || DEFAULT_KEY] || [];
      return [].concat(_toConsumableArray(list));
    }
  }, {
    key: 'getPropertyNames',
    value: function getPropertyNames() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      return this.getPropertyCommands(type).map(function (descriptor) {
        return descriptor.propertyName;
      });
    }
  }, {
    key: 'getCommands',
    value: function getCommands() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_KEY;

      if (type && this.descriptors[type]) {
        return Object.assign({}, this.descriptors[DEFAULT_KEY], this.descriptors[type]);
      }

      return this.descriptors[DEFAULT_KEY];
    }
  }, {
    key: 'getCommand',
    value: function getCommand(propertyName) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_KEY;

      var descriptor = this.descriptors[type] && this.descriptors[type][propertyName] || this.descriptors[DEFAULT_KEY] && this.descriptors[DEFAULT_KEY][propertyName];

      return descriptor || null;
    }
  }, {
    key: 'call',
    value: function call(parentRequest, pack, resultRequest) {
      var _this2 = this;

      // FIXME should it also check for resultRequest to not appear in the list?
      var list = this.converter ? this.converter.lookupForPending(pack.args) : null;

      if (list && list.length) {
        // FIXME Need to test on all platforms: might not work because may need list of
        // Promise objects, not Targets
        return Promise.all(list).then(function () {
          return _this2.callImmediately(parentRequest, pack, resultRequest);
        });
      }

      return this.callImmediately(parentRequest, pack, resultRequest);
    }
  }, {
    key: 'callImmediately',
    value: function callImmediately(parentRequest, pack, resultRequest) {
      var propertyName = pack.propertyName;

      var descriptor = this.getCommand(propertyName, Object(__WEBPACK_IMPORTED_MODULE_4__utils_getResourceType__["a" /* default */])(parentRequest));
      if (descriptor instanceof __WEBPACK_IMPORTED_MODULE_0__command_Descriptor__["c" /* default */]) {
        return new Promise(function (resolve) {
          resolve(descriptor.handler(parentRequest, pack, resultRequest));
        });
      }

      return reject('Command descriptor for "' + name + '" was not found.');
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

  return Handlers;
}();

Handlers.events = HandlersEvents;


var createHandlers = function createHandlers(proxyEnabled) {
  return new Handlers(proxyEnabled);
};

/* unused harmony default export */ var _unused_webpack_default_export = (Handlers);

/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__hasOwnProperty__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__command_Descriptor__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__command_Reserved__ = __webpack_require__(23);
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }





/**
 * Checks for Descriptor uniqueness and reserved words usage.
 * @param {DataAccessInterface.Descriptor} descriptor
 * @param {Object.<string, DataAccessInterface.Descriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.Descriptor>} properties
 * @private
 */
var applyDescriptor = function applyDescriptor(descriptor, descriptors, properties) {
  var propertyName = descriptor.propertyName;

  if (propertyName in __WEBPACK_IMPORTED_MODULE_2__command_Reserved__["a" /* default */].names) {
    throw new Error('Name "' + propertyName + '" is reserved and cannot be used in descriptor.');
  }
  if (Object(__WEBPACK_IMPORTED_MODULE_0__hasOwnProperty__["a" /* default */])(descriptors, propertyName) && descriptors[propertyName] instanceof __WEBPACK_IMPORTED_MODULE_1__command_Descriptor__["c" /* default */]) {
    throw new Error('Field names should be unique, "' + String(propertyName) + '" field has duplicates.');
  }
  descriptors[propertyName] = descriptor;
  // FIXME Check if new implementation uses virtual commands properly
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
  handlers.forEach(function (value) {
    if (value instanceof __WEBPACK_IMPORTED_MODULE_1__command_Descriptor__["c" /* default */]) {
      applyDescriptor(value, descriptors, properties);
    }
  });
};

/**
 * @param {Object} handlers
 * @param {Object.<string, DataAccessInterface.Descriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.Descriptor>} properties
 * @private
 */
var filterHash = function filterHash(handlers, descriptors, properties) {
  if (!handlers) return;
  [].concat(_toConsumableArray(Object.getOwnPropertyNames(handlers)), _toConsumableArray(Object.getOwnPropertySymbols(handlers))).forEach(function (propertyName) {
    var value = handlers[propertyName];
    // FIXME unnecessary typeof(value is defined), could be replaced with instanceof
    if (typeof value === 'function') {
      value = Object(__WEBPACK_IMPORTED_MODULE_1__command_Descriptor__["b" /* createDescriptor */])(propertyName, value);
    }
    if (value instanceof __WEBPACK_IMPORTED_MODULE_1__command_Descriptor__["c" /* default */]) {
      applyDescriptor(value, descriptors, properties);
    }
  });
};

/**
 * @method Handlers.filterHandlers
 * @param {Array|Object} handlers
 * @param {Object.<string, DataAccessInterface.Descriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.Descriptor>} properties
 */
/* harmony default export */ __webpack_exports__["a"] = (function (handlers, descriptors, properties) {
  if (handlers instanceof Array) {
    filterArray(handlers, descriptors, properties);
  } else {
    filterHash(handlers, descriptors, properties);
  }
});

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export createProxyHandlers */
/* unused harmony export applyProxyWithDefaultHandlers */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createProxyFactory; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Factory__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_hasOwnProperty__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__command_internal_ProxyCommands__ = __webpack_require__(16);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var createFunctionWrapper = function createFunctionWrapper(target) {
  // INFO Target must be a function so I could use Proxy.call() interceptor.
  function requestTargetProxy() {}

  requestTargetProxy.target = target;

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
  return target[__WEBPACK_IMPORTED_MODULE_2__command_internal_ProxyCommands__["a" /* ProxyCommandFields */].get](name);
};

// INFO Proxy should be already applied, so no need in additional wrapping
var proxyApply = function proxyApply(wrapper, thisValue, args) {
  return wrapper.target[__WEBPACK_IMPORTED_MODULE_2__command_internal_ProxyCommands__["a" /* ProxyCommandFields */].apply](null, args);
};

var proxySet = function proxySet(wrapper, name, value) {
  var target = wrapper.target;


  if (name in target || name in EXCLUSIONS || (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'symbol') {
    target[name] = value;
    return value;
  }

  if (__WEBPACK_IMPORTED_MODULE_2__command_internal_ProxyCommands__["a" /* ProxyCommandFields */].set in target) {
    target[__WEBPACK_IMPORTED_MODULE_2__command_internal_ProxyCommands__["a" /* ProxyCommandFields */].set](name, value);
    return true;
  }

  return false;
};

var proxyHas = function proxyHas(wrapper, name) {
  return Object(__WEBPACK_IMPORTED_MODULE_1__utils_hasOwnProperty__["a" /* default */])(wrapper.target, name);
};

var proxyDeleteProperty = function proxyDeleteProperty(wrapper, name) {
  var target = wrapper.target;

  if (__WEBPACK_IMPORTED_MODULE_2__command_internal_ProxyCommands__["a" /* ProxyCommandFields */].deleteProperty in target) {
    target[__WEBPACK_IMPORTED_MODULE_2__command_internal_ProxyCommands__["a" /* ProxyCommandFields */].deleteProperty](name);
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
  if (Object(__WEBPACK_IMPORTED_MODULE_1__utils_hasOwnProperty__["a" /* default */])(EXCLUSIONS, name)) {
    return Object.getOwnPropertyDescriptor(wrapper, name);
  }
  return Object.getOwnPropertyDescriptor(wrapper.target, name);
};

var proxyGetPrototypeOf = function proxyGetPrototypeOf(wrapper) {
  return Object.getPrototypeOf(wrapper.target);
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
    getOwnPropertyDescriptor: proxyGetOwnPropertyDescriptor,
    getPrototypeOf: proxyGetPrototypeOf
  }, handlers);
};

var PROXY_HANDLERS = createProxyHandlers();

var ProxyFactory = function (_Factory) {
  _inherits(ProxyFactory, _Factory);

  function ProxyFactory(handlers, cacheImpl) {
    _classCallCheck(this, ProxyFactory);

    var _this = _possibleConstructorReturn(this, (ProxyFactory.__proto__ || Object.getPrototypeOf(ProxyFactory)).call(this, __WEBPACK_IMPORTED_MODULE_0__Factory__["a" /* NO_INIT */]));

    _this.handlers = handlers;
    _this.factory = Object(__WEBPACK_IMPORTED_MODULE_0__Factory__["b" /* createRequestFactory */])(handlers, cacheImpl);
    _this.factory.decorator.setFactory(_this);
    return _this;
  }

  _createClass(ProxyFactory, [{
    key: 'create',
    value: function create(promise) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var pack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var cacheable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var instance = this.factory.create(promise, name, pack, cacheable);

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
  }]);

  return ProxyFactory;
}(__WEBPACK_IMPORTED_MODULE_0__Factory__["c" /* default */]);

var applyProxyWithDefaultHandlers = function applyProxyWithDefaultHandlers(target) {
  return wrapWithProxy(target, PROXY_HANDLERS);
};

var createProxyFactory = function createProxyFactory(handlers, cacheImpl) {
  return new ProxyFactory(handlers, cacheImpl);
};

/* unused harmony default export */ var _unused_webpack_default_export = (ProxyFactory);

/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createDecorator; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__command_CallbackFactory__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_getResourceType__ = __webpack_require__(17);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




var Decorator = function () {
  function Decorator(factory, handlers) {
    _classCallCheck(this, Decorator);

    this.handlers = handlers;
    this.members = new __WEBPACK_IMPORTED_MODULE_0__command_CallbackFactory__["a" /* default */](factory);
  }

  _createClass(Decorator, [{
    key: 'apply',
    value: function apply(request) {
      var _this = this;

      if (!this.handlers.available) {
        return request;
      }

      var descriptors = this.handlers.getPropertyCommands(Object(__WEBPACK_IMPORTED_MODULE_1__utils_getResourceType__["a" /* default */])(request));
      return descriptors.forEach(function (descriptor) {
        request[descriptor.propertyName] = _this.members.get(descriptor);
      });
    }
  }, {
    key: 'setFactory',
    value: function setFactory(factory) {
      if (factory) {
        this.members.setFactory(factory);
      }
    }
  }]);

  return Decorator;
}();

var createDecorator = function createDecorator(factory, handlers) {
  return new Decorator(factory, handlers);
};

/* unused harmony default export */ var _unused_webpack_default_export = (Decorator);

/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Flow__ = __webpack_require__(42);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var createHandlerFor = function createHandlerFor(flow, propertyName, command, isTemporaryFn, cacheable) {
  function commandHandler() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return flow.apply(this, propertyName, command, args, isTemporaryFn, cacheable);
  }

  return commandHandler;
};

var CallbackFactory = function () {
  function CallbackFactory() {
    var factory = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, CallbackFactory);

    this.members = new Map();
    this.flow = null;

    this.setFactory(factory);
  }

  /**
   * @param {Descriptor} descriptor
   * @returns {Function}
   * @private
   */


  _createClass(CallbackFactory, [{
    key: 'get',
    value: function get(descriptor) {
      var propertyName = descriptor.propertyName;

      if (!this.members.has(propertyName)) {
        this.members.set(propertyName, this.create(propertyName, descriptor.command, descriptor.isTemporary, descriptor.cacheable));
      }

      return this.members.get(propertyName);
    }
  }, {
    key: 'create',
    value: function create(propertyName, command, isTemporaryFn) {
      var cacheable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      return createHandlerFor(this.flow, propertyName, command, isTemporaryFn, cacheable);
    }
  }, {
    key: 'setFactory',
    value: function setFactory(factory) {
      this.flow = null;

      if (factory) {
        this.flow = new __WEBPACK_IMPORTED_MODULE_0__Flow__["a" /* default */](factory);
      }
    }
  }]);

  return CallbackFactory;
}();

/* harmony default export */ __webpack_exports__["a"] = (CallbackFactory);

/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__request_target_getInternals__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__request_target_toJSON__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_reject__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_createRequestPackage__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__request_target_setTemporary__ = __webpack_require__(43);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }







var Flow = function () {
  function Flow(factory) {
    _classCallCheck(this, Flow);

    this.factory = factory;
  }

  _createClass(Flow, [{
    key: 'apply',
    value: function apply(target, propertyName, command, args, isTemporaryFn) {
      var cacheable = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

      var internals = Object(__WEBPACK_IMPORTED_MODULE_0__request_target_getInternals__["a" /* default */])(target);

      // call target must be a request target
      if (internals) {
        var pack = Object(__WEBPACK_IMPORTED_MODULE_3__utils_createRequestPackage__["a" /* default */])(propertyName, command, args, Object(__WEBPACK_IMPORTED_MODULE_1__request_target_toJSON__["a" /* default */])(target));

        if (cacheable) {
          var child = this.factory.getCached(pack);

          if (child) {
            return child;
          }
        }

        return this.makeChildReqest(target, pack, isTemporaryFn, cacheable);
      }

      return this.rejectCall();
    }
  }, {
    key: 'rejectCall',
    value: function rejectCall() {
      return this.factory.create(Object(__WEBPACK_IMPORTED_MODULE_2__utils_reject__["a" /* default */])('Target object is not an instance of Target, so cannot be used for calls.'));
    }
  }, {
    key: 'makeChildReqest',
    value: function makeChildReqest(target, propertyName, pack, isTemporaryFn) {
      var cacheable = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      // this wil be populated on internals.send() call and passed into target's
      // promise when it will be executed on next tick, so there are no need in deferred anymore
      var promise = void 0;
      var internals = Object(__WEBPACK_IMPORTED_MODULE_0__request_target_getInternals__["a" /* default */])(target);
      var child = this.factory.create(Promise.resolve().then(function () {
        return promise;
      }), propertyName, pack, cacheable);

      promise = internals.send(propertyName, pack, child);
      this.checkState(promise, isTemporaryFn, target, child, pack);
      return child;
    }
  }, {
    key: 'checkState',
    value: function checkState(promise, isTemporaryFn, parentRequest, childRequest, pack) {
      return promise.then(function (data) {
        var isTemporary = Boolean(isTemporaryFn(parentRequest, childRequest, pack, data));
        Object(__WEBPACK_IMPORTED_MODULE_4__request_target_setTemporary__["a" /* default */])(childRequest, isTemporary);
      });
    }
  }]);

  return Flow;
}();

/* harmony default export */ __webpack_exports__["a"] = (Flow);

/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getInternals__ = __webpack_require__(3);
/**
 * Created by Oleg Galaburda on 16.11.17.
 */



/* harmony default export */ __webpack_exports__["a"] = (function (target, value) {
  return Object(__WEBPACK_IMPORTED_MODULE_0__getInternals__["a" /* default */])(target).temporary = Boolean(value);
});

/***/ }),
/* 44 */
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
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__ = __webpack_require__(1);


/* harmony default export */ __webpack_exports__["a"] = (function (target) {
  return Boolean(target && target[__WEBPACK_IMPORTED_MODULE_0__utils_TARGET_INTERNALS__["a" /* default */]]);
});

/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getStatus__ = __webpack_require__(47);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__ = __webpack_require__(9);
/**
 * Created by Oleg Galaburda on 16.11.17.
 */




/* harmony default export */ __webpack_exports__["a"] = (function (value) {
  var status = Object(__WEBPACK_IMPORTED_MODULE_0__getStatus__["a" /* default */])(value);
  return status ? status === __WEBPACK_IMPORTED_MODULE_1__utils_TargetStatus__["a" /* default */].PENDING : undefined;
});

/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getInternals__ = __webpack_require__(3);
/**
 * Created by Oleg Galaburda on 16.11.17.
 */



/* harmony default export */ __webpack_exports__["a"] = (function (target) {
  var internals = Object(__WEBPACK_IMPORTED_MODULE_0__getInternals__["a" /* default */])(target);
  return internals ? internals.status : undefined;
});

/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__TARGET_DATA__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getRawResource__ = __webpack_require__(20);



/* harmony default export */ __webpack_exports__["a"] = (function (object) {
  var data = Object(__WEBPACK_IMPORTED_MODULE_1__getRawResource__["a" /* default */])(object);
  return data ? data[__WEBPACK_IMPORTED_MODULE_0__TARGET_DATA__["a" /* default */]] : null;
});

/***/ })
/******/ ]);
});
//# sourceMappingURL=deferred-data-access.js.map