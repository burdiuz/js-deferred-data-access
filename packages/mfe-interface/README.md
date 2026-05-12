# @actualwave/mfe-interface

Bidirectional [DDA](https://github.com/burdiuz/js-deferred-data-access) proxy channel between microfrontends using DOM `CustomEvent`.

## Transport protocol

Communication is two-layered:

| Layer | Mechanism | Detail |
|-------|-----------|--------|
| Transport | `CustomEvent` dispatched on the MFE's root `HTMLElement` | Two event names: one per direction |
| Data | `event.detail` | DDA protocol message |

Two event names are used on the same element to prevent echo:
- `dda-host-message` — shell/bus → MFE
- `dda-guest-message` — MFE → shell/bus

## One-to-one

```typescript
import { initializeMFEInterface, connectMFEInterface } from '@actualwave/mfe-interface';

// Inside the microfrontend (guest)
const { root: shellApi } = await initializeMFEInterface({
  element: document.getElementById('mfe-root'),
  root: { getUser: () => ({ id: 1, name: 'Alice' }) },
});

// Inside the shell (host)
const { root: mfeApi } = await connectMFEInterface({
  element: document.getElementById('mfe-root'),
  root: { navigate: (path) => router.push(path) },
});

const user = await mfeApi.getUser();
```

## One-to-many with MFEInterfaceBus

```typescript
import { MFEInterfaceBus } from '@actualwave/mfe-interface';

const bus = new MFEInterfaceBus();

// Register each microfrontend
for (const el of document.querySelectorAll('[data-mfe]')) {
  await bus.connect({ element: el as HTMLElement, root: shellApi });
}

// Broadcast a call to every connected MFE
await bus.forEach(async (mfeApi) => {
  await mfeApi.onThemeChange('dark');
});

// Disconnect one
bus.disconnect(someElement);

// Tear everything down
bus.disconnectAll();
```

## Custom event names

```typescript
await initializeMFEInterface({
  element,
  hostEventName: 'shell:message',
  guestEventName: 'mfe:message',
});
```

## API

### `initializeMFEInterface(config)` → `Promise<Connection>`

Initialises the microfrontend (guest) side.

### `connectMFEInterface(config)` → `Promise<Connection>`

Initialises the shell (host) side for one-to-one use.

### `MFEInterfaceBus`

| Member | Description |
|--------|-------------|
| `connect(config)` | Connect and cache a microfrontend element. Returns cached connection on repeated calls. |
| `disconnect(element)` | Stop and remove a connection. |
| `disconnectAll()` | Stop and remove all connections. |
| `get(element)` | Return the cached connection for an element. |
| `size` | Number of active connections. |
| `forEach(cb)` | Call `cb(root, element)` for every connection in parallel. |

### `MFEInterfaceConfig`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `element` | `HTMLElement` | — | Root element of the microfrontend. |
| `hostEventName` | `string` | `'dda-host-message'` | Event name for shell→MFE messages. |
| `guestEventName` | `string` | `'dda-guest-message'` | Event name for MFE→shell messages. |
| `root` | `object` | — | API object to expose to the other side. |
| `id` | `string` | — | Optional interface identifier. |
| `handshakeTimeout` | `number` | — | Handshake timeout in ms. |
| `responseTimeout` | `number` | — | Per-call response timeout in ms. |
