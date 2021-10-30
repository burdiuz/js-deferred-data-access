# RESTObject

RESTObject is the library that allows usage of dot notation instead of strings while accessing remote API. It depends on [Direct Proxies support](http://caniuse.com/proxy) and [fetch()](http://caniuse.com/fetch) optionally.

## Usage
To start you need to create RESTObject instance with specifying starting point of your API.

```javascript
import { createRESTObject } from '@actualwave/rest-object';

const api = createRESTObject('/example/api');
```

Path is optional, by default it will be an empty string.

```javascript
const api = createRESTObject(); // will work too
```

and then you can go to your endpoint just like it is a property of an `api` object.

```javascript
const api = createRESTObject('/example/api');

const { body: list } = await api.portal.users.customers;
console.log(list);
```
Each property is an object that represents API endpoint, each allows CRUD operations/methods and using Promise.then() or catch() methods starts HTTP request to server using `/example/api/portal/users/customers` URL. 

These objects are instances of Proxy wrapper that intercepts accessing object fields and interprets them issuing HTTP requests.
- getting field value normally returns new endpoint object, only if Promise methods(`then()` or `catch()`) used it issues HTTP GET request
- calling field as a method issues HTTP POST request
- setting field value issues HTTP PUT request
- deleting field issues HTTP DELETE request

Additionally they also contains set of CRUD methods
- `create()` for HTTP POST request
- `read()` for HTTP GET request
- `update()` for HTTP PUT request
- `delete()` for HTTP DELETE request
- and `patch()` for HTTP PATCH request
These methods have identical set of arguments `method(queryParameters: object | null, body: any | undefined, customFetchParameters: Object | undefined): Promise<unknown>`.

You can store endpoint as object in a usual way.
```javascript
const customers = api.portal.users.customers;
```

After receiving endpoint object, you can work with it by accessing fields
```javascript
const { body: list } = await customers;
console.log(list);
```
Or callign one of CRUD methods
```javascript
const { body: list } = await customers.read();
console.log(list);
```

Store endpoint for URL `example/api/portal/users/customers/workshops/invoices/123` and then make GET request:
```javascript
const invoices = customers.workshops.invoices;

const { body: data } = await invoices[123];
// do something with invoice data
```


## Example
```javascript
const api = createRESTObject('/example/api');
const customers = api.portal.users.customers;

// GET /portal/users/customers
const { body: list } = await customers;

// POST /portal/users/customers with body { name: 'New User' }
const { body: list } = await customers({ name: 'New User' });

// PUT /portal/users/customers/111 with body { name: 'New User' }
customers['111'] = { name: 'New User' };

// DELETE /portal/users/customers/111
delete customers['111'];
```

There are no way to get a Promise on setting new value or deleting field, so we don't know when these operations complete. To wait for completion we may use `forLatest()` method. It returns Promise for last HTTP request for this endpoint object.
```javascript
const api = createRESTObject('/example/api');
const customers = api.portal.users.customers;

// PUT /portal/users/customers/111 with body { name: 'New User' }
customers['111'] = { name: 'New User' };
await customers.forLatest();

// DELETE /portal/users/customers/111
delete customers['111'];
await customers.forLatest();
```

HTTP requests can be invoked using CRUD methods
```javascript
const api = createRESTObject('/example/api');
const customers = api.portal.users.customers;

// GET /portal/users/customers
const { body: list } = await customers.read();

// POST /portal/users/customers with body { name: 'New User' }
const { body: list } = await customers.create(null, { name: 'New User' });

// PUT /portal/users/customers/111 with body { name: 'New User' }
customers['111'].update(null, { name: 'New User' });

// PATCH /portal/users/customers/111 with body { firstName: 'New' }
customers['111'].patch(null, { firstName: 'New' });

// DELETE /portal/users/customers/111
customers['111'].delete();
```

RESTObject works with [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) by default, this can be changed using `setFetchFn()`.

```javascript
import { setFetchFn } from '@actualwave/rest-object';
import fetch from 'node-fetch';

setFetchFn(fetch);
```

Any function could be set, and to work properly, it should accept same arguments and return Promise with Response-type object.

## Example

This repo contains working example, for [browser](https://github.com/burdiuz/js-deferred-data-access/tree/master/examples/rest-object) and [nodejs](https://github.com/burdiuz/js-deferred-data-access/blob/master/testing/rest-object-test.js). To start browser example, run `npm install`, `npm start` and then visit `http://localhost:8081/`.

> Written with [StackEdit](https://stackedit.io/).
