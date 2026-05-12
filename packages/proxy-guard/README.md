# @actualwave/proxy-guard

Policy-based access control for any JavaScript object. Wrap an object with a rule set; every property access, assignment, deletion, and method call is evaluated against the rules before execution.

## Installation

```bash
npm install @actualwave/proxy-guard
```

## Usage

```typescript
import { createGuardedProxy, PermissionError } from '@actualwave/proxy-guard';

const api = {
  users: { list: () => db.users.findAll() },
  admin: { deleteUser: (id) => db.users.delete(id) },
};

const proxy = createGuardedProxy(api, {
  context: () => getCurrentUser(),   // sync or async
  defaultPolicy: 'deny',             // deny everything not explicitly allowed
  rules: [
    {
      match: { path: /^users/ },
      allow: true,
    },
    {
      match: { path: /^admin/ },
      allow: (cmd, user) => user.roles.includes('admin'),
      deny:  (cmd, user) => new PermissionError(`${user.name} cannot access admin`),
    },
  ],
});

await proxy.users.list();          // ✓
await proxy.admin.deleteUser(1);   // ✗ PermissionError if not admin
```

## Rules

Rules are evaluated in order. The first matching rule's `allow`/`deny` result is used.

```typescript
interface Rule<Ctx> {
  match?: {
    type?: string | string[];        // ProxyCommand value(s)
    name?: string | RegExp | string[]; // property name
    path?: string | RegExp;          // full dot-separated path
  };
  allow?: boolean | ((cmd, ctx) => boolean | Promise<boolean>);
  deny?:  boolean | ((cmd, ctx) => Error | Promise<Error | undefined>);
  transform?: (cmd, ctx) => GuardCommand | Promise<GuardCommand>;
  before?:    (cmd, ctx) => unknown;  // hook: runs before execution
  after?:     (cmd, ctx, result) => unknown; // hook: runs after execution
  continue?:  boolean;  // if true, continue evaluating subsequent rules after this one matches
}
```

## `GuardCommand` fields

| Field | Type | Description |
|---|---|---|
| `type` | `string` | ProxyCommand value (`P:get`, `P:set`, `P:del`, `P:apply`) |
| `path` | `string` | Dot-separated full path from proxy root, e.g. `'admin.deleteUser'` |
| `name` | `string` | Leaf property name |
| `args?` | `unknown[]` | Call arguments (for `P:apply`) |
| `value?` | `unknown` | Assigned value (for `P:set`) |

## `createGuardedProxy` options

| Option | Type | Default | Description |
|---|---|---|---|
| `rules` | `Rule<Ctx>[]` | required | Ordered rule list |
| `context` | `() => Ctx \| Promise<Ctx>` | — | Factory for the context object passed to every rule function |
| `defaultPolicy` | `'allow' \| 'deny'` | `'allow'` | Fallback when no rule matches |

## Errors

`PermissionError` (extends `Error`) is thrown when access is denied. Its `name` is `'PermissionError'`.
