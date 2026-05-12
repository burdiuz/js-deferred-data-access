# @actualwave/broadcast-interface

Bidirectional DDA RPC over the browser's [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) API, enabling transparent method calls between same-origin tabs, windows, iframes, and workers without a central coordinator.

## Installation

```bash
npm install @actualwave/broadcast-interface
```

## Usage

```typescript
import { createBroadcastInterface } from '@actualwave/broadcast-interface';
import { InterfaceType } from '@actualwave/deferred-data-access/interface';

// Tab A — HOST (exposes the API)
const { root: guestApi, stop } = await createBroadcastInterface({
  channelName: 'app-channel',
  type: InterfaceType.HOST,
  root: {
    getState: () => store.getState(),
    dispatch: (action) => store.dispatch(action),
  },
});

// Tab B — GUEST (consumes the API)
const { root: hostApi, stop } = await createBroadcastInterface({
  channelName: 'app-channel',
  type: InterfaceType.GUEST,
});

const state = await hostApi.getState();
await hostApi.dispatch({ type: 'INCREMENT' });
```

## API

### `createBroadcastInterface(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `channelName` | `string` | required | Name passed to `new BroadcastChannel(name)` |
| `type` | `InterfaceType` | required | `HOST` (waits) or `GUEST` (initiates handshake) |
| `root` | `unknown` | — | Object to expose to the other side |
| `id` | `string` | auto | Stable endpoint ID |
| `remoteId` | `string` | — | Expected remote ID for targeted pairing |
| `handshakeTimeout` | `number` | — | ms before handshake times out |
| `handshakeInterval` | `number` | — | ms between handshake pings (GUEST) |
| `responseTimeout` | `number` | — | ms before a remote call times out |

Returns `Promise<{ root, stop, pool, wrap, pendingRequests }>`.

## Notes

- The underlying `BroadcastChannel` is closed when `stop()` is called.
- `BroadcastChannel` broadcasts to all subscribers; DDA's `source`/`target` message fields handle routing so only addressed endpoints process each message.
- For one-host-many-guests scenarios, create one `initialize()` per guest pair (each with a unique `id`/`remoteId`), or build a multiplexer on top.
