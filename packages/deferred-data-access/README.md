# Deferred Data Access
Deferred Data Access(DDA) is a framework for building async CRUD APIs. It transforms object calls into commands that can be interpreted by custom function.

## How it works
1. Framework accepts an async handler function and returns an object.
```javascript
const obj = handle((command, context) => {
  let result;

  // Some logic that gets somewhere value and saves in into "result" variable.

  return result;
})();
```
2. Developer accesses object property and gets Promise
```javascript
const value = await obj.prop;
```
3. Framework records property access into a command object, handler function is called with command object as an argument.
```javascript
{ type: ProxyCommand.GET, name: 'prop' }
```
4. Whatever function returns is returned as promise value.

DDA can operate in two modes, mode is defined by passing second argument to handle() function.
 * lazy - Default mode, custom handler function is called only when `then()` or `catch()` methods are accessed. Accessing `obj.child.grand.prop.then(func)` calls function once.
 * reactive - Non-lazy, custom handler function called on every operation. Accessing `obj.child.grand.prop.then(func)` calls function 3 times.

There are multiple predefined commands that can be passed to handler function.
 * ProxyCommand.**GET** - when property accessed
 * ProxyCommand.**SET** - when property is set, new value is recorded as `value` in command object
 * ProxyCommand.**DELETE_PROPERTY** - when property is being deleted
 * ProxyCommand.**APPLY** - when function is called, call arguments recorded as `value` of command object
 * ProxyCommand.**METHOD_CALL** - only generated in lazy mode, it combines GET and APPLY commands.


## Projects made with DDA
 * [RESTObject](https://github.com/burdiuz/js-deferred-data-access/tree/master/packages/rest-object)
 * [WorkerInterface](https://github.com/burdiuz/js-deferred-data-access/tree/master/packages/worker-interface)
