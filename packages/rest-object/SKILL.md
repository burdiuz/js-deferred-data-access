---
name: "rest-object"
description: "DDA proxy that translates dot-notation property access and method calls into REST HTTP requests via fetch. Use when building a typed REST client, intercepting or transforming requests before they are sent, or accessing the latest in-flight request Promise."
license: "MIT"
compatibility: "Browser and Node.js 18+ (requires global fetch). TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/rest-object"
---

# @actualwave/rest-object

Wraps a base URL in a DDA proxy. Property accesses and method calls build a URL path + HTTP method, then fire a `fetch` request. The response body is parsed based on `Content-Type`.

## Key exports

```typescript
import { createRESTObject } from '@actualwave/rest-object';
import { setFetchFn, getFetchFn } from '@actualwave/rest-object';
```

## Core pattern

```typescript
const api = createRESTObject('https://api.example.com');

const user  = await api.users.get(1);       // GET /users/1
const users = await api.users.getAll();     // GET /users
await api.users.post({ name: 'Alice' });    // POST /users
await api.users(1).put({ name: 'Bob' });   // PUT /users/1
await api.users(1).delete();               // DELETE /users/1
```

## Request transformation

```typescript
const api = createRESTObject(
  'https://api.example.com',
  (request) => ({ ...request, headers: { Authorization: `Bearer ${token}` } }),
);
```

## Custom fetch

```typescript
import { setFetchFn } from '@actualwave/rest-object';

setFetchFn((url, params) => customFetch(url, params));
```

## Response shape

Each resolved value is `{ body, contentType, response }` where `body` is:
- `response.json()` for `application/json`
- `response.text()` for `text/*`
- `response.formData()` for `multipart/form-data`
- `response.body` (ReadableStream) for everything else

## `forLatest` pattern

Use `proxy.forLatest()` to get the Promise of the most recent in-flight call for a given context. Useful for cancelling stale requests:

```typescript
const latest = await api.users.forLatest();
```

## Key invariants

- Uses `recordHandlerCalls` + `latestCallFor` from `.../record` to track in-flight Promises.
- `setFetchFn` replaces the global fetch for all `RESTObject` instances.
- The `requestFn` transformer receives the generated `Request` and must return a (possibly modified) `Request`.
