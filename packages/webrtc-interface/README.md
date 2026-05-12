# @actualwave/webrtc-interface

Bidirectional DDA RPC over an [`RTCDataChannel`](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel). Call methods on a remote peer directly, with automatic cleanup when the channel closes.

## Installation

```bash
npm install @actualwave/webrtc-interface
```

## Usage

```typescript
import { createDataChannelInterface, waitForOpen } from '@actualwave/webrtc-interface';
import { InterfaceType } from '@actualwave/deferred-data-access/interface';

// After RTCPeerConnection signalling…
const open = await waitForOpen(dataChannel, 5_000);

const { root: peerApi, stop } = await createDataChannelInterface({
  channel: open,
  type: InterfaceType.HOST,  // or GUEST
  root: {
    ping: () => 'pong',
    compute: (n: number) => n * 2,
  },
  handshakeTimeout: 5_000,
  responseTimeout:  10_000,
});

const result = await peerApi.compute(21); // → 42

// Clean up manually or on channel close (auto-stop is wired internally)
channel.addEventListener('close', stop);
```

## `waitForOpen(channel, timeout?): Promise<RTCDataChannel>`

Resolves immediately if `readyState === 'open'`. Waits for the `'open'` event if `'connecting'`. Rejects if `'closing'` or `'closed'`, or if the optional timeout (ms) expires first.

## `createDataChannelInterface(options): Promise<InterfaceResult>`

| Option | Type | Description |
|---|---|---|
| `channel` | `RTCDataChannel` | Must be in `'open'` state (use `waitForOpen` if unsure) |
| `type` | `InterfaceType` | `HOST` (waits) or `GUEST` (initiates handshake) |
| `root` | `unknown` | API to expose to the remote peer |
| `handshakeTimeout` | `number` | ms before handshake times out |
| `responseTimeout` | `number` | ms before a remote call times out |

The returned `stop()` also removes the internal `'close'` listener. The channel is **not** closed by `stop()` — do that yourself if needed.

## Notes

- Messages are JSON-serialised. Non-serialisable values (functions, circular refs) will throw.
- `stop()` is called automatically when the remote peer closes the channel.
- For the loopback / same-page P2P pattern used in tests, see the [example](../../examples/webrtc-interface/index.html).
