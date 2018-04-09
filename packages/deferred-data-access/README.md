# Deferred Data Access

## TODOs
introduce type-specific handlers
1. add possibility to define child object or list of handlers when creating DAI
```javascript
DataAccessInterface.create({
  defaultHandler: function(){},
  myClass1: {
    cmdHandler: function(){}
  },
  myClass1: [
    Descriptor.create(...)
  ]
});
```
2. add type argument to RequestHandlers, decorator, so type-specific handlers will be stored/applied
3. type specific handlers always should fallback to defaults if not exists
4. when applying handlers first should be applied default and then type-specific, default might be overwritten in case of name collision
5. default handlers applied on RequestType creation and type-specific when its resolved.
6. introduce Descriptor.resourceType for supposed resource type. Can be string or function that results in a string.
7. Add WeakMap ResourcePool -- not iterable, not going to work

[![Coverage Status](https://coveralls.io/repos/github/burdiuz/js-deferred-data-access/badge.svg?branch=master)](https://coveralls.io/github/burdiuz/js-deferred-data-access?branch=master)
[![Build Status](https://travis-ci.org/burdiuz/js-deferred-data-access.svg?branch=master)](https://travis-ci.org/burdiuz/js-deferred-data-access)

Deferred Data Access helps in cases where communication is limited to asynchronous data exchange using simple types and impossible to send data by reference.  
 - Client <==> Server
 - Application <==> Worker
 - Application <==> Application from different origin
 - Application <==> Chrome extension
This library tries to solve "passing data by reference", by introducing new data type called "resource". Basically its a reference to remote object(resource target value). 
Deferred Data Access allows you to manage such remote object references, aka resources and allows to call commands(execute remote procedures) upon them. 
 - Remote resource is some remote entity that may hold data or API methods to be called.
 - Command is some action that may be applied to remote resource.
   
## How it works
Deferred Data Access library has DataAccessInterface class, its main role to be an entry point, facade of the library. On initialization it creates all internal objects needed to work with resources. Its main API consists of two methods:
 - parse(data:*):* -- Lookup through data, if resource reference found, convert it to special object of RequestTarget type that represents remote resource and allows calling registered commands on itself. Basically, it prepares data after its received from remote environment.
 - toJSON(data:*):* -- Lookup through data for resource objects, it can be an instance of TargetResource, IConvertible or Function types. When such resource type was found, it will be replaced with reference object. Basically it prepares data to be sent to remote environment.

To start creating references, you should define first your resources that can be sent
```javascript
// sender code
/**
 * @type {*}
 */
var value = {any:'thing'};
/**
 * initialize Deferred Data Access 
 * @type {DataAccessInterface}
 */
var api = DataAccessInterface.create({});
/**
 * create a resource
 * @type {TargetResource}
 */
var resource = api.pool.set(value);
/**
 * get resource reference object 
 * @type {Object}
 */
var reference = resource.toJSON();
```
Value of `reference` variable is ready to be sent to other environment. On receiving side you should wrap received reference with resource wrapper object
```javascript
// receiver code
/**
 * initialize Deferred Data Access 
 * @type {DataAccessInterface}
 */
var api = DataAccessInterface.create({});
// somehow receive data from sender
var reference = result.data;
/**
 * create a remote resource object from reference
 * @type {DataAccessInterface.RequestTarget}
 */
var resource = api.parse(reference);
```
 Now we have a resource on sender environment and reference on receiver environment. At this point you cannot do much with resource, if you send it back to sender, it can be transformed into resource target value. Remote resource is represented on receiver side with object of `DataAccessInterface.RequestTarget` type. In cases like this, when we don't use any commands, such objects will have only two methods -- `then()` and `catch()`, Promise methods to know if resource data received. Currently `resource`'s internal Promise already resolved, because data already received.  
  
True potential of the library lies in defining and using commands that can be applied to any resource. To demonstrate how commands work, lets send a function as a resource.  
```javascript
// sender code
/**
 * @type {Function}
 */
function trace() {
  console.log(arguments);
}
/**
 * initialize Deferred Data Access 
 * @type {DataAccessInterface}
 */
var api = DataAccessInterface.create({});
/**
 * get resource reference object 
 * @type {Object}
 */
var reference = api.toJSON(trace);
```
Function type is one of types that will be automatically converter to a resource, so we don't need to explicitly add it into ResourcePool.  
On receiver side we can add a command that will stick to remote resource.
```javascript
// receiver code
/**
 * Command handler function, will be executed each time command called.
 */
function callHandler(target, pack, deferred, result) {
	/*
	at this point control of command execution ends and developer is responsible in what happen next.
	*/
	deferred.resolve('called');
}
/**
 * initialize Deferred Data Access 
 * @type {DataAccessInterface}
 */
var api = DataAccessInterface.create({
  call: callHandler
});
// somehow receive data from sender
var reference = result.data;
/**
 * create a remote resource object from reference
 * @type {DataAccessInterface.RequestTarget}
 */
var resource = api.parse(reference);
resource.call('parameter');
```
Now we created DataAccessInterface instance passing object with command handler. Each command internally represented by `DataAccessInterface.Descriptor` object. Passing object with handlers will create descriptors with command types equal to property names, that's why `resource` received new `call` method.

To start using Deferred Data Access you should instantiate DataAccessInterface and tell it, what type of 
commands it may apply to received resources. 
Command in a simplest way consists of command type string and handler function.
 - command type is a name of command, identifier which will be passed to handler function, when command was called.
 - handler function is function that will be called to execute command.
To define a command you can use hash Object with functions
```javascript
var commands = {
    trace: function(parentRequest, data, deferred, resultRequest) {
                   console.log(data);
                   deferred.resolve('le data was logged.');
               }
};
```
This code will create a command that will be available via "trace" name and calling command will execute `commands.trace()` function. 
As you can see, handler function receives some arguments and it must support this signature, also ot should resolve or reject Promise 
via `deferred.resolve()` and `deferred.reject()` when command finished execution. 
Deferred Data Access library has special class `Descriptor` that represents commands and can be used to describe them.
```javascript
var commands = [
    Descriptor.create(
      'trace', 
      function(parentRequest, data, deferred, resultRequest) {
        console.log(data);
        deferred.resolve('le data was logged.');
      }
    );
];
```
This is equivalent to code above just using Descriptor instance to describe command.
With Descriptor you can define more settings for command, like property name or are received resources cacheable.

After getting all commands you want to execute on remote resources, you are ready to create DataAccessInterface.
```javascript
/**
 * @type {DataAccessInterface}
 */
var api = DataAccessInterface.create(commands);
```
That's it, DataAccessInterface will do all preparations and after creating its instance you are ready to go.  
  
To demonstrate how it works I will emulate remote environment with using separate ResourcePool, not connected to any DataAccessInterface instance.  
```javascript
/**
 * @type {DataAccessInterface.ResourcePool}
 */
var remotePool = DataAccessInterface.ResourcePool.create();
```
DataAccessInterface class was used as a package to some of internal classes like ResourcePool, that may be handy for developer. 
ResourcePool object is used to store resource target values. Target value for resource can be anything, any object/value of supported type.
By default, ResourcePool accepts values of "object" and "function" types. To become a resource, value don't need to have any API methods 
or properties. When storing new resource, ResourcePool creates unique Id and stores value by Id, it does not change value in any way.
```javascript
var myResourceValue = {    
};
/**
 * @type {TargetResource}
 */
var link = remotePool.set(myResource);
```
Here we created a target value for resource `myResourceValue` and then registered it in `remotePool`. As a result we received new object of `TargetResource` type.
This object holds information about resource(resource Id, resource type and resource pool id) and we will use it to pass resource to `api`.
Let's imagine `remotePool` and its resources are stored in other, remote environment(on server?). 
To pass information to client, where `api` was created, we should transform resource to raw object and then pass this data in some way to client.
```javascript
var remoteData = {
    result: link.toJSON()
};
// data was sent to client and on client we pass received data to api
/**
 * @type {DataAccessInterface.RequestTarget}
 */
var data = api.parse(remoteData);
```
`remoteData` contains raw object that holds other object representing resource. `api.parse()` does lookup to find resource raw objects in 
data and transform them into special objects, instance of RequestTarget class. RequestTarget instance is a representation of remote resource, 
it does not contain resource target value, just resource id, type and ResourcePool id where it was stored in remote environment. 
 

