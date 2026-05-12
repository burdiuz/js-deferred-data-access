---
name: "broadcast-interface"
description: "Bidirectional DDA RPC over BroadcastChannel. Use when wiring same-origin cross-tab or cross-window method calls, connecting HOST and GUEST endpoints on a named channel, or understanding how createBroadcastInterface wraps DDA initialize()."
license: "MIT"
compatibility: "Browser environments with BroadcastChannel support. TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/broadcast-interface"
---

# @actualwave/broadcast-interface

Thin wrapper around `@actualwave/deferred-data-access/interface` that wires DDA's `initialize()` to a `BroadcastChannel`, enabling transparent bidirectional RPC between same-origin browsing contexts (tabs, windows, workers).

## Key export

```typescript
import { createBroadcastInterface } from '@actualwave/broadcast-interface';
import { InterfaceType } from '@actualwave/deferred-data-access/interface';
```

## Pattern

```typescript
// HOST tab
const { root: guestApi, stop } = await createBroadcastInterface({
  channelName: 'my-channel',
  type: InterfaceType.HOST,
  root: { getValue: () => 42 },
});

// GUEST tab
const { root: hostApi, stop } = await createBroadcastInterface({
  channelName: 'my-channel',
  type: InterfaceType.GUEST,
});
const v = await hostApi.getValue(); // → 42
```

## Options (`BroadcastInterfaceOptions`)

`channelName` (string, required), `type` (InterfaceType, required), `root?`, `id?`, `remoteId?`, `handshakeTimeout?`, `handshakeInterval?`, `responseTimeout?`.

## Implementation notes

- Creates `new BroadcastChannel(channelName)` internally; closes it on `stop()`.
- `preprocessResponse` strips the `MessageEvent` wrapper (`event.data`).
- DDA's `source`/`target` message fields handle routing — broadcast messages not addressed to a given endpoint are silently ignored.
- One HOST supports only one GUEST per `createBroadcastInterface` call. For multi-peer scenarios, create separate calls with distinct `id`/`remoteId` pairs.
