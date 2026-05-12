---
name: "proxy-guard"
description: "DDA-based permission and policy layer for any JavaScript object. Use when enforcing per-path access rules, building RBAC/ABAC guards, transforming commands before execution, or running before/after hooks on property access and method calls."
license: "MIT"
compatibility: "Node.js 18+. Browser. TypeScript 5+. Tests use Jest 30 + ts-jest."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/proxy-guard"
---

# @actualwave/proxy-guard

Wraps any object with an ordered rule set. Every proxy operation — GET, SET, DELETE, APPLY — is evaluated against the rules before execution. Throws `PermissionError` on denial.

## Key exports

```typescript
import { createGuardedProxy, PermissionError } from '@actualwave/proxy-guard';
import type { GuardCommand, Rule, GuardOptions, AllowFn, DenyFn, TransformFn, HookFn } from '@actualwave/proxy-guard';
```

## Core pattern

```typescript
const proxy = createGuardedProxy(target, {
  context: () => getUser(),     // sync or async; result passed to every rule fn
  defaultPolicy: 'deny',        // 'allow' | 'deny' (default 'allow')
  rules: [
    {
      match: { path: /^public/ },
      allow: true,
    },
    {
      match: { path: /^admin/, type: 'P:apply' },
      allow: (cmd, user) => user.roles.includes('admin'),
      deny:  (cmd, user) => new PermissionError(`${user.name}: admin only`),
    },
  ],
});
```

## `Rule<Ctx>` fields

| Field | Type | Description |
|---|---|---|
| `match.type` | `string \| string[]` | ProxyCommand value(s) to match |
| `match.name` | `string \| RegExp \| string[]` | Leaf property name |
| `match.path` | `string \| RegExp` | Full dot-separated path from root |
| `allow` | `boolean \| AllowFn` | Permit the operation |
| `deny` | `boolean \| DenyFn` | Return an `Error` to throw |
| `transform` | `TransformFn` | Mutate the `GuardCommand` before execution |
| `before` | `HookFn` | Run side-effect before execution |
| `after` | `HookFn` | Run side-effect after execution with result |
| `continue` | `boolean` | Continue evaluating subsequent rules after this match |

## `GuardCommand` fields

`type` (ProxyCommand string), `path` (dot-joined full path), `name` (leaf), `args?`, `value?`.

## Key invariants

- Rules are evaluated in array order; first match wins unless `continue: true`.
- `METHOD_CALL` is normalised to `APPLY` for `match.type` comparison.
- All rule functions (`allow`, `deny`, `transform`, `before`, `after`) may return Promises.
- `PermissionError.name === 'PermissionError'` for `instanceof`-free detection.
- Context factory runs once per handler invocation; result is shared across all matching rules for that operation.
