---
name: "webrtc-interface"
description: "DDA RPC over an RTCDataChannel for peer-to-peer method calls between browsers. Use when wiring bidirectional DDA on top of WebRTC, waiting for a data channel to open, or handling auto-cleanup when the remote peer disconnects."
license: "MIT"
compatibility: "Browser with WebRTC support. TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/webrtc-interface"
---

# @actualwave/webrtc-interface

Wraps an open `RTCDataChannel` in DDA's `initialize()`. Messages are JSON-serialised. `stop()` is called automatically when the remote peer closes the channel.

## Key exports

```typescript
import { createDataChannelInterface, waitForOpen } from '@actualwave/webrtc-interface';
import { InterfaceType } from '@actualwave/deferred-data-access/interface';
```

## Pattern

```typescript
// After RTCPeerConnection signalling…
const open = await waitForOpen(dataChannel, 5_000);

const { root: peerApi, stop } = await createDataChannelInterface({
  channel: open,
  type: InterfaceType.HOST,   // or GUEST
  root: localApi,
  handshakeTimeout: 5_000,
});

const result = await peerApi.compute(42);
channel.addEventListener('close', stop); // optional: already auto-wired internally
```

## `waitForOpen(channel, timeout?)`

| `readyState` | Result |
|---|---|
| `'open'` | resolves immediately |
| `'connecting'` | waits for `'open'` event (optional timeout ms) |
| `'closing'` | rejects immediately |
| `'closed'` | rejects immediately |

## `DataChannelInterfaceOptions`

`channel` (RTCDataChannel, required), `type` (InterfaceType, required), `root?`, `handshakeTimeout?`, `responseTimeout?`, `id?`, `remoteId?`.

## Key invariants

- The channel must be in `'open'` state when passed to `createDataChannelInterface` — use `waitForOpen` if unsure.
- `stop()` from the returned result removes the internal `'close'` listener **and** calls the underlying `initialize()` stop. The channel itself is NOT closed.
- Messages are `JSON.stringify`/`JSON.parse` — non-serialisable values will throw.
- Auto-stop fires when the remote closes the channel, cleaning up pending requests.
