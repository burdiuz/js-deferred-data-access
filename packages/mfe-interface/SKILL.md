---
name: "mfe-interface"
description: "Bidirectional DDA RPC between a shell and microfrontends via DOM CustomEvents. Use when connecting a shell app to MFE components, broadcasting shell API to multiple MFEs, or managing a bus of MFE connections with MFEInterfaceBus."
license: "MIT"
compatibility: "Browser. TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/mfe-interface"
---

# @actualwave/mfe-interface

DDA bidirectional RPC over DOM `CustomEvent`. Two distinct event names on the MFE root element prevent echo: `dda-host-message` (shell → MFE) and `dda-guest-message` (MFE → shell).

## Key exports

```typescript
import {
  initializeMFEInterface,  // GUEST (MFE side)
  connectMFEInterface,     // HOST (shell side, one-to-one)
  MFEInterfaceBus,         // HOST (shell side, one-to-many)
} from '@actualwave/mfe-interface';
```

## One-to-one

```typescript
// Shell (HOST)
const { root: mfeApi } = await connectMFEInterface({ element, root: shellApi });

// MFE (GUEST)
const { root: shellApi } = await initializeMFEInterface({ element, root: mfeApi });
```

## One-to-many with `MFEInterfaceBus`

```typescript
const bus = new MFEInterfaceBus();
await bus.connect({ element: el1, root: shellApi });
await bus.connect({ element: el2, root: shellApi });

await bus.forEach(async (root) => root.onThemeChange('dark'));
bus.disconnect(el1);
bus.disconnectAll();
```

## `MFEInterfaceConfig`

`element` (HTMLElement, required), `root?`, `hostEventName?` (default `'dda-host-message'`), `guestEventName?` (default `'dda-guest-message'`), `id?`, `handshakeTimeout?`, `responseTimeout?`.

## `MFEInterfaceBus` members

`connect(config)`, `disconnect(element)`, `disconnectAll()`, `get(element)`, `size`, `forEach(cb)`.

## Key invariant

`connectMFEInterface` returns a cached connection on repeated calls with the same element — safe to call multiple times.
