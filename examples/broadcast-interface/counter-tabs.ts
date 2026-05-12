import { createBroadcastInterface } from '@actualwave/broadcast-interface';
import { InterfaceType } from '@actualwave/deferred-data-access/interface';

// ---------------------------------------------------------------------------
// This file shows how two browser tabs share a live counter via BroadcastChannel.
//
// Run the HOST snippet in one tab and the GUEST snippet in another tab (or
// in a shared worker context). Both use the same channel name so DDA can
// complete the handshake automatically.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// HOST tab — owns the counter and exposes it
// ---------------------------------------------------------------------------

let count = 0;

const counterApi = {
  increment() { count++; },
  decrement() { count--; },
  value() { return count; },
  reset()     { count = 0; },
};

const { stop: stopHost } = await createBroadcastInterface({
  channelName: 'app:counter',
  type: InterfaceType.HOST,
  root: counterApi,
});

// The HOST is now serving. Stop when the tab closes.
window.addEventListener('beforeunload', stopHost);

// ---------------------------------------------------------------------------
// GUEST tab — talks to the HOST through the same channel
// ---------------------------------------------------------------------------

const { root: remote, stop: stopGuest } = await createBroadcastInterface({
  channelName: 'app:counter',
  type: InterfaceType.GUEST,
});

const api = remote as typeof counterApi;

await (api as any).increment();
await (api as any).increment();
await (api as any).increment();
await (api as any).decrement();

const current = await (api as any).value();
console.log('Counter value:', current); // 2

stopGuest();
